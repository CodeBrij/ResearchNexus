import streamlit as st
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import ast
import matplotlib.pyplot as plt
import seaborn as sns

# Set page configuration
st.set_page_config(
    page_title="Academic Paper Recommender",
    page_icon="📚",
    layout="wide"
)

@st.cache_data
def load_data():
    """Load and preprocess the dataset"""
    try:
        # Try to load the CSV file
        df = pd.read_csv("dblp-v10.csv")
        
        # Data cleaning
        df.dropna(subset=['authors'], inplace=True)
        df['abstract'].fillna("Unknown", inplace=True)
        df['venue'].fillna("Unknown", inplace=True)
        df['references'].fillna("[]", inplace=True)
        
        # Filter data
        df = df.dropna(subset=["abstract"])
        df = df[df["n_citation"] > 10]
        
        # If dataset is too large, sample it
        if len(df) > 100000:
            df = df.sample(n=100000, random_state=42)
            
        # Combine title and abstract
        df['combined_text'] = df['title'] + " " + df['abstract']
        
        return df
    except Exception as e:
        st.error(f"Error loading data: {e}")
        # Return a small sample dataset for demonstration
        return pd.DataFrame({
            'title': ['Sample Paper 1', 'Sample Paper 2', 'Sample Paper 3'],
            'abstract': ['This is a sample abstract about AI', 'This is about biology research', 'This is about computer networks'],
            'authors': [['Author A', 'Author B'], ['Author C'], ['Author D', 'Author E']],
            'n_citation': [50, 30, 20],
            'venue': ['Journal A', 'Conference B', 'Journal C'],
            'year': [2020, 2019, 2018],
            'id': ['id1', 'id2', 'id3'],
            'references': [['ref1', 'ref2'], ['ref3'], ['ref4', 'ref5']]
        })

@st.cache_resource
def create_vectorizer(df):
    """Create and fit the TF-IDF vectorizer"""
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(df['combined_text'])
    return vectorizer, tfidf_matrix

def recommend_papers(query, vectorizer, tfidf_matrix, df, top_n=5):
    """Recommend papers based on query"""
    # Transform the user's query
    query_vec = vectorizer.transform([query])
    
    # Compute cosine similarity between the query and all papers
    cosine_sim = cosine_similarity(query_vec, tfidf_matrix)
    
    # Get indices of the most similar papers
    similar_indices = cosine_sim.argsort()[0][-top_n:][::-1]
    
    # Get similarity scores
    similarity_scores = cosine_sim[0][similar_indices]
    
    # Prepare recommendations based on similarity
    recommendations = []
    for i, idx in enumerate(similar_indices):
        paper = df.iloc[idx]
        
        # Parse authors if they're stored as a string representation of a list
        if isinstance(paper['authors'], str):
            try:
                authors = ast.literal_eval(paper['authors'])
            except:
                authors = [paper['authors']]
        else:
            authors = paper['authors']
            
        recommendations.append({
            'title': paper['title'],
            'authors': authors,
            'citations': paper['n_citation'],
            'year': paper['year'],
            'venue': paper['venue'],
            'id': paper['id'],
            'similarity': similarity_scores[i]
        })
    
    return recommendations, similarity_scores.mean()

# Main app
def main():
    st.title("📚 Academic Paper Recommendation System")
    
    # Sidebar
    st.sidebar.title("Options")
    top_n = st.sidebar.slider("Number of recommendations", 1, 10, 5)
    
    # Load data
    with st.spinner("Loading data..."):
        df = load_data()
    
    # Create vectorizer
    with st.spinner("Processing text data..."):
        vectorizer, tfidf_matrix = create_vectorizer(df)
    
    # Display dataset info
    st.sidebar.subheader("Dataset Information")
    st.sidebar.info(f"Total papers: {len(df)}\nYear range: {df['year'].min()} - {df['year'].max()}")
    
    # Search interface
    st.subheader("Search for Research Papers")
    query = st.text_input("Enter a research topic or keywords:", "")
    
    col1, col2 = st.columns([3, 1])
    
    with col1:
        search_btn = st.button("🔍 Search", use_container_width=True)
    
    with col2:
        advanced_options = st.expander("Advanced Options")
        with advanced_options:
            filter_year = st.checkbox("Filter by year")
            if filter_year:
                year_range = st.slider("Select year range", 
                                      int(df['year'].min()), 
                                      int(df['year'].max()), 
                                      (int(df['year'].min()), int(df['year'].max())))
    
    # Display recommendations when search button is clicked
    if search_btn and query:
        recommendations, avg_similarity = recommend_papers(query, vectorizer, tfidf_matrix, df, top_n)
        
        st.subheader("Recommended Papers")
        st.info(f"Query: '{query}' | Model Confidence: {avg_similarity * 100:.2f}%")
        
        if recommendations:
            # Create a tab for each recommendation
            tabs = st.tabs([f"Paper {i+1}" for i in range(len(recommendations))])
            
            for i, (tab, paper) in enumerate(zip(tabs, recommendations)):
                with tab:
                    st.markdown(f"### {paper['title']}")
                    
                    col1, col2 = st.columns([3, 1])
                    
                    with col1:
                        st.markdown("**Authors:**")
                        if isinstance(paper['authors'], list):
                            authors_list = [author.strip("'") for author in paper['authors']]
                            st.write(", ".join(authors_list))
                        else:
                            st.write(paper['authors'])
                        
                        st.markdown(f"**Publication Venue:** {paper['venue']}")
                        st.markdown(f"**Year:** {paper['year']}")
                    
                    with col2:
                        st.metric("Citations", f"{paper['citations']}")
                        st.progress(paper['similarity'])
                        st.caption(f"Relevance: {paper['similarity'] * 100:.1f}%")
            
            # Visualization
            st.subheader("Visualization")
            viz_tab1, viz_tab2 = st.tabs(["Citation Comparison", "Relevance Scores"])
            
            with viz_tab1:
                fig, ax = plt.subplots(figsize=(10, 5))
                data = pd.DataFrame({
                    'Paper': [f"Paper {i+1}" for i in range(len(recommendations))],
                    'Citations': [paper['citations'] for paper in recommendations]
                })
                sns.barplot(x='Paper', y='Citations', data=data, ax=ax)
                ax.set_title('Citation Comparison')
                st.pyplot(fig)
            
            with viz_tab2:
                fig, ax = plt.subplots(figsize=(10, 5))
                data = pd.DataFrame({
                    'Paper': [f"Paper {i+1}" for i in range(len(recommendations))],
                    'Relevance': [paper['similarity'] * 100 for paper in recommendations]
                })
                sns.barplot(x='Paper', y='Relevance', data=data, ax=ax)
                ax.set_title('Relevance Scores (%)')
                st.pyplot(fig)
        else:
            st.warning("No papers found for the given query.")
    
    # About section  
    st.sidebar.markdown("---")
    st.sidebar.subheader("About")
    st.sidebar.info(
        """
        This app recommends academic papers based on your research interests.
        It uses TF-IDF and cosine similarity to find relevant papers.
        
        The recommendations are sorted by relevance to your query.
        """
    )

if __name__ == "__main__":
    main()