// Format time and date - getting as hh-mm and using 24 hour format

export const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString("en-us",{
        hour:"2-digit",
        minute:"2-digit",
        hour12:false,
    });
}