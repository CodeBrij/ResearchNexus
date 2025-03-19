# app.py
# Streamlit application for Integrated Research Paper and Dataset Recommendation System

import streamlit as st
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import LabelEncoder, StandardScaler
import re
import nltk
import plotly.express as px
from difflib import get_close_matches
from collections import Counter
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Embedding, LSTM
import os
import pickle

# Set page config
st.set_page_config(
    page_title="Research & Dataset Recommender",
    page_icon="📚",
    layout="wide"
)

# Download NLTK resources (if needed)
@st.cache_resource
def download_nltk_resources():
    try:
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        nltk.download('wordnet', quiet=True)
        return True
    except Exception as e:
        st.warning(f"Error downloading NLTK resources: {e}")
        return False

# Preprocess data functions
def preprocess_text(text):
    if isinstance(text, str):
        # Convert to lowercase
        text = text.lower()
        # Remove special characters and digits
        text = re.sub(r'[^\w\s]', '', text)
        text = re.sub(r'\d+', '', text)
        return text
    return ''

def extract_terms(term_str):
    try:
        if isinstance(term_str, str):
            if term_str.startswith('[') and term_str.endswith(']'):
                return ' '.join(eval(term_str))
            return term_str
        return ''
    except:
        return term_str if isinstance(term_str, str) else ''

# Process paper data and build TF-IDF model
@st.cache_resource
def preprocess_paper_data(df, max_features=5000):
    # Apply preprocessing to titles and summaries
    df['processed_title'] = df['titles'].apply(preprocess_text)
    df['processed_summary'] = df['summaries'].apply(preprocess_text)
    
    # Combine title and summary
    df['combined_features'] = df['processed_title'] + ' ' + df['processed_summary']
    
    # Extract terms as text
    df['terms_text'] = df['terms'].apply(extract_terms)
    
    # Add terms to the features
    df['features'] = df['combined_features'] + ' ' + df['terms_text']
    
    # Create TF-IDF vectors
    tfidf_vectorizer = TfidfVectorizer(max_features=max_features)
    tfidf_matrix = tfidf_vectorizer.fit_transform(df['features'])
    
    return df, tfidf_vectorizer, tfidf_matrix

# Process dataset data and build dataset recommendation model
@st.cache_resource
def preprocess_dataset_data(df):
    # Fill NaN values
    df_filled = df.copy()
    df_filled.fillna("", inplace=True)
    
    # Combine features
    df_filled["combined_text"] = df_filled["datasetName"] + " " + df_filled["about"] + " " + df_filled["categoryName"]
    
    # Encode categories
    label_encoder = LabelEncoder()
    df_filled["category_encoded"] = label_encoder.fit_transform(df_filled["categoryName"])
    
    # Scale encoded categories
    scaler = StandardScaler()
    df_filled[["category_encoded"]] = scaler.fit_transform(df_filled[["category_encoded"]])
    
    # Encode dataset names
    dataset_encoder = LabelEncoder()
    df_filled["dataset_encoded"] = dataset_encoder.fit_transform(df_filled["datasetName"])
    
    return df_filled, label_encoder, scaler

# Build and train dataset recommendation model
@st.cache_resource
def build_dataset_model(df, epochs=10):
    # Create and compile model
    model = Sequential([
        Embedding(input_dim=len(df["categoryName"].unique()) + 1, output_dim=16),
        LSTM(32, return_sequences=True),
        LSTM(16),
        Dense(8, activation='relu'),
        Dense(len(df["datasetName"].unique()), activation='softmax')
    ])
    
    model.compile(loss='sparse_categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
    
    # Prepare data for training
    X = df[["category_encoded"]]
    y = df["dataset_encoded"]
    
    # Train model (we'll keep it simple for the app - in practice you'd want validation)
    model.fit(X, y, epochs=epochs, batch_size=16, verbose=0)
    
    return model

# Get paper recommendations
def get_paper_recommendations(user_query, tfidf_vectorizer, tfidf_matrix, paper_df, top_n=5):
    # Preprocess the user query
    processed_query = preprocess_text(user_query)
    
    # Transform the query to TF-IDF vector
    query_vector = tfidf_vectorizer.transform([processed_query])
    
    # Calculate cosine similarity
    similarity_scores = cosine_similarity(query_vector, tfidf_matrix).flatten()
    
    # Get indices of top N most similar papers
    top_indices = similarity_scores.argsort()[:-top_n-1:-1]
    
    # Return the recommendations
    recommendations = paper_df.iloc[top_indices][['titles', 'summaries', 'terms']]
    
    return recommendations, similarity_scores[top_indices], top_indices

# Get dataset recommendations
def get_dataset_recommendations(user_query, dataset_df, label_encoder, scaler, model, top_n=5):
    # Find closest matching category
    categories = label_encoder.classes_
    
    # Find the closest matching category
    matches = get_close_matches(user_query.lower(), [cat.lower() for cat in categories], n=1, cutoff=0.3)
    
    if not matches:
        # If no direct match, try to find a match in the dataset descriptions
        all_descriptions = dataset_df['combined_text'].tolist()
        best_score = 0
        best_idx = 0
        
        for idx, desc in enumerate(all_descriptions):
            # Simple word overlap score
            words1 = set(user_query.lower().split())
            words2 = set(desc.lower().split())
            overlap = len(words1.intersection(words2))
            
            if overlap > best_score:
                best_score = overlap
                best_idx = idx
        
        if best_score > 0:
            closest_category = dataset_df.iloc[best_idx]['categoryName']
        else:
            # Default to first category if no match found
            closest_category = categories[0]
    else:
        # Find the original case version of the matching category
        for cat in categories:
            if cat.lower() == matches[0]:
                closest_category = cat
                break
        else:
            closest_category = categories[0]
    
    # Transform category to vector
    try:
        category_idx = label_encoder.transform([closest_category])
        user_vec = scaler.transform([[category_idx[0]]])
    except:
        # If transformation fails, use the first category as fallback
        category_idx = label_encoder.transform([categories[0]])
        user_vec = scaler.transform([[category_idx[0]]])
    
    # Get predictions
    predictions = model.predict(user_vec)
    top_indices = predictions.argsort()[0][-top_n:][::-1]
    
    # Get recommended datasets
    recommended_datasets = dataset_df.iloc[top_indices][["datasetName", "about", "link", "categoryName"]]
    
    return recommended_datasets, closest_category

# Analyze terms in recommendations
def analyze_recommendations_terms(recommendations):
    all_terms = []
    
    for _, row in recommendations.iterrows():
        try:
            term_str = row['terms']
            if isinstance(term_str, str) and term_str.startswith('[') and term_str.endswith(']'):
                terms = eval(term_str)
                all_terms.extend(terms)
        except:
            continue
    
    if all_terms:
        # Count term frequencies
        return Counter(all_terms).most_common(10)
    return None

# Create model save/load functions
def save_model(model, filename):
    model.save(filename)

def load_model(filename):
    return tf.keras.models.load_model(filename)

# Main app function
def main():
    # Add a title and description
    st.title("📚 Research & Dataset Recommendation System")
    st.markdown("""
    This app recommends both research papers and datasets based on your interests. 
    Enter a query related to your research interests, and the system will find the most relevant 
    papers from the arXiv dataset and related datasets from our dataset collection.
    """)
    
    # Download NLTK resources
    download_nltk_resources()
    
    # Sidebar for file upload and options
    with st.sidebar:
        st.header("Data Options")
        
        # Paper data options
        st.subheader("Research Papers")
        paper_file = st.file_uploader("Upload paper CSV file (must have 'titles', 'summaries', 'terms' columns)", type="csv")
        
        if paper_file is None:
            st.info("Using default arxiv_data.csv file for papers. Upload your own file to use custom data.")
            paper_file_path = "arxiv_data.csv"
            st.session_state['use_default_paper'] = True
        else:
            st.success("Custom paper file uploaded successfully!")
            paper_file_path = paper_file
            st.session_state['use_default_paper'] = False
        
        # Dataset data options
        st.subheader("Datasets")
        dataset_file = st.file_uploader("Upload dataset CSV file (must have 'datasetName', 'about', 'categoryName' columns)", type="csv")
        
        if dataset_file is None:
            st.info("Using default datasets.csv file. Upload your own file to use custom data.")
            dataset_file_path = "datasets.csv"
            st.session_state['use_default_dataset'] = True
        else:
            st.success("Custom dataset file uploaded successfully!")
            dataset_file_path = dataset_file
            st.session_state['use_default_dataset'] = False
        
        # Recommendation options
        st.header("Recommendation Options")
        num_paper_recommendations = st.slider("Number of paper recommendations", 1, 20, 5)
        num_dataset_recommendations = st.slider("Number of dataset recommendations", 1, 10, 3)
        
        # Model options
        st.header("Model Options")
        max_features = st.slider("Max features for TF-IDF", 1000, 10000, 5000)
        
        # Visualization options
        st.header("Visualization Options")
        show_term_analysis = st.checkbox("Show term analysis", True)
    
    # Load and process paper data
    try:
        if 'paper_data_processed' not in st.session_state:
            with st.spinner("Loading and processing research paper data..."):
                try:
                    paper_df = pd.read_csv(paper_file_path)
                    paper_df, tfidf_vectorizer, tfidf_matrix = preprocess_paper_data(paper_df, max_features)
                    
                    # Save to session state
                    st.session_state['paper_df'] = paper_df
                    st.session_state['tfidf_vectorizer'] = tfidf_vectorizer
                    st.session_state['tfidf_matrix'] = tfidf_matrix
                    st.session_state['paper_data_processed'] = True
                    
                    st.success(f"Research paper data loaded successfully with {len(paper_df)} papers!")
                except Exception as e:
                    st.error(f"Error loading paper data: {e}")
                    st.error("Please make sure your paper CSV file has 'titles', 'summaries', and 'terms' columns.")
        else:
            paper_df = st.session_state['paper_df']
            tfidf_vectorizer = st.session_state['tfidf_vectorizer']
            tfidf_matrix = st.session_state['tfidf_matrix']
    except Exception as e:
        st.error(f"Error processing paper data: {e}")
    
    # Load and process dataset data
    try:
        if 'dataset_data_processed' not in st.session_state:
            with st.spinner("Loading and processing dataset data..."):
                try:
                    dataset_df = pd.read_csv(dataset_file_path)
                    dataset_df, label_encoder, scaler = preprocess_dataset_data(dataset_df)
                    
                    # Build and train model
                    model_file = "dataset_model.h5"
                    if os.path.exists(model_file):
                        dataset_model = load_model(model_file)
                    else:
                        dataset_model = build_dataset_model(dataset_df)
                        save_model(dataset_model, model_file)
                    
                    # Save to session state
                    st.session_state['dataset_df'] = dataset_df
                    st.session_state['label_encoder'] = label_encoder
                    st.session_state['scaler'] = scaler
                    st.session_state['dataset_model'] = dataset_model
                    st.session_state['dataset_data_processed'] = True
                    
                    st.success(f"Dataset data loaded successfully with {len(dataset_df)} datasets!")
                except Exception as e:
                    st.error(f"Error loading dataset data: {e}")
                    st.error("Please make sure your dataset CSV file has 'datasetName', 'about', and 'categoryName' columns.")
        else:
            dataset_df = st.session_state['dataset_df']
            label_encoder = st.session_state['label_encoder']
            scaler = st.session_state['scaler']
            dataset_model = st.session_state['dataset_model']
    except Exception as e:
        st.error(f"Error processing dataset data: {e}")
    
    # Query input
    st.header("Enter Your Research Query")
    query = st.text_input("What research topics are you interested in?", 
                          placeholder="e.g. deep learning for computer vision")
    
    # Example queries buttons
    st.markdown("### Or try one of these example queries:")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if st.button("Deep Learning"):
            query = "deep learning neural networks"
            st.session_state['query'] = query
    
    with col2:
        if st.button("Computer Vision"):
            query = "computer vision object detection"
            st.session_state['query'] = query
    
    with col3:
        if st.button("Natural Language Processing"):
            query = "natural language processing transformers"
            st.session_state['query'] = query
    
    # If there's a query in session state, use it
    if 'query' in st.session_state:
        query = st.session_state['query']
        # Clear it so it doesn't persist on next page load
        st.session_state['query'] = ''
    
    # Get recommendations if query is provided
    if query and 'paper_data_processed' in st.session_state and 'dataset_data_processed' in st.session_state:
        # Create tabs for paper and dataset recommendations
        tab1, tab2 = st.tabs(["Research Papers", "Datasets"])
        
        with tab1:
            with st.spinner("Finding relevant papers..."):
                paper_recommendations, paper_scores, paper_indices = get_paper_recommendations(
                    query, 
                    tfidf_vectorizer, 
                    tfidf_matrix, 
                    paper_df, 
                    top_n=num_paper_recommendations
                )
                
                # Display paper recommendations
                st.header(f"Top {len(paper_recommendations)} Paper Recommendations")
                st.markdown(f"*Based on your query: **{query}***")
                
                # Display each recommendation
                for i, (_, row) in enumerate(paper_recommendations.iterrows()):
                    with st.expander(f"{i+1}. {row['titles']} (Similarity: {paper_scores[i]:.4f})", expanded=i==0):
                        st.markdown(f"**Summary:** {row['summaries']}")
                        
                        # Extract terms
                        try:
                            if isinstance(row['terms'], str) and row['terms'].startswith('[') and row['terms'].endswith(']'):
                                terms = eval(row['terms'])
                                st.markdown(f"**Categories:** {', '.join(terms)}")
                            else:
                                st.markdown(f"**Categories:** {row['terms']}")
                        except:
                            st.markdown(f"**Categories:** {row['terms']}")
                
                # Generate and display visualizations
                st.header("Paper Analysis")
                
                # Visualization tabs
                vis_tab1, vis_tab2 = st.tabs(["Similarity Scores", "Term Analysis"])
                
                with vis_tab1:
                    # Create a bar chart of similarity scores
                    fig = px.bar(
                        x=[f"Paper {i+1}" for i in range(len(paper_scores))],
                        y=paper_scores,
                        labels={"x": "Recommendation", "y": "Similarity Score"},
                        title="Similarity Scores for Paper Recommendations",
                        color=paper_scores,
                        color_continuous_scale="Blues"
                    )
                    st.plotly_chart(fig, use_container_width=True)
                
                with vis_tab2:
                    if show_term_analysis:
                        # Get term distribution in recommendations
                        term_counts = analyze_recommendations_terms(paper_recommendations)
                        
                        if term_counts:
                            terms, counts = zip(*term_counts)
                            
                            # Create a horizontal bar chart
                            fig = px.bar(
                                x=counts,
                                y=terms,
                                orientation='h',
                                labels={"x": "Count", "y": "Term"},
                                title="Most Common Terms in Recommended Papers",
                                color=counts,
                                color_continuous_scale="Viridis"
                            )
                            st.plotly_chart(fig, use_container_width=True)
                            
                            st.markdown("""
                            This chart shows the most common research areas/terms in your recommended papers.
                            A higher frequency indicates a stronger presence of that research area in your results.
                            """)
                        else:
                            st.info("No term analysis available for these recommendations.")
                    else:
                        st.info("Term analysis is disabled. Enable it in the sidebar to see term distributions.")
        
        with tab2:
            with st.spinner("Finding relevant datasets..."):
                dataset_recommendations, matched_category = get_dataset_recommendations(
                    query,
                    dataset_df,
                    label_encoder,
                    scaler,
                    dataset_model,
                    top_n=num_dataset_recommendations
                )
                
                # Display dataset recommendations
                st.header(f"Top {len(dataset_recommendations)} Dataset Recommendations")
                st.markdown(f"*Based on your query: **{query}** (Matched category: {matched_category})*")
                
                # Display each dataset recommendation
                for i, (_, row) in enumerate(dataset_recommendations.iterrows()):
                    with st.expander(f"{i+1}. {row['datasetName']} ({row['categoryName']})", expanded=i==0):
                        st.markdown(f"**Description:** {row['about']}")
                        st.markdown(f"**Category:** {row['categoryName']}")
                        st.markdown(f"**Link:** [{row['link']}]({row['link']})")
                
                # Display category distribution visualization
                st.header("Dataset Category Analysis")
                
                # Create a pie chart of categories
                category_counts = dataset_recommendations['categoryName'].value_counts()
                fig = px.pie(
                    values=category_counts.values,
                    names=category_counts.index,
                    title="Categories of Recommended Datasets",
                )
                st.plotly_chart(fig, use_container_width=True)
                
                st.markdown("""
                This chart shows the distribution of categories in your recommended datasets.
                A larger slice indicates a stronger presence of that category in your results.
                """)

# Run the app
if __name__ == "__main__":
    main()