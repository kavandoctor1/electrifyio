import pandas as pd
from sentence_transformers import SentenceTransformer
from sqlalchemy import create_engine, text
import os
import time
import pygame

# Initialize pygame mixer

# Folder containing the MP3 files
folder_path = 'Songs'


username = 'SUPERUSER'
password = 'SYS2' # Replace password with password you set
hostname = 'localhost' 
port = '1972' 
namespace = 'USER'
CONNECTION_STRING = f"iris://{username}:{password}@{hostname}:{port}/{namespace}"


engine = create_engine(CONNECTION_STRING)
conn = engine.connect()
df = pd.read_csv('songs_new.csv')
df.head()


df['Category'] = df['Category'].str.replace(',', '')
df.head()


sql = f"""
        CREATE TABLE songs_featuress1 (
    songname VARCHAR(255),
    category VARCHAR(255),
    description VARCHAR(2000),
    descriptionss_vectors VECTOR(DOUBLE, 384)
)
        """
result = conn.execute(text(sql))
# Load a pre-trained sentence transformer model. This model's output vectors are of size 384
model = SentenceTransformer('all-MiniLM-L6-v2') 

# Generate embeddings for all descriptions at once. Batch processing makes it faster
embeddingsss1 = model.encode(df['SongsDescriptions'].tolist(), normalize_embeddings=True)

# Add the embeddings to the DataFrame
df['descriptions_vectors'] = embeddingsss1.tolist()
df.head()


for index, row in df.iterrows():
    sql = text("""
        INSERT INTO songs_featuress1
        (songname, category, description, descriptionss_vectors) 
        VALUES (:name, :category, :description, TO_VECTOR(:descriptionss_vectors))
    """)
    conn.execute(sql, {
        'name': row['SongName'], 
        'category': row['Category'],  
        'description': row['SongsDescriptions'], 
        'descriptionss_vectors': str(row['descriptions_vectors'])
    })
def extract_singer(song_name):
    parts = song_name.split('by')
    if len(parts) > 1:
        return parts[1].split('(')[0].strip()  # Assuming format "Song Name" by Singer (Year)
    return ""



sql = f"""
        CREATE TABLE songs_featuress1 (
    songname VARCHAR(255),
    category VARCHAR(255),
    description VARCHAR(2000),
    descriptionss_vectors VECTOR(DOUBLE, 384)
)
        """
result = conn.execute(text(sql))

model = SentenceTransformer('all-MiniLM-L6-v2') 

# Generate embeddings for all descriptions at once. Batch processing makes it faster
embeddingsss1 = model.encode(df['SongsDescriptions'].tolist(), normalize_embeddings=True)

# Add the embeddings to the DataFrame
df['descriptions_vectors'] = embeddingsss1.tolist()

def evaluate(prompt):
    # description_search = "trying hard and hopeful"
    search_vector = model.encode(prompt, normalize_embeddings=True).tolist()
    sql = text("""
         SELECT TOP 3 * FROM songs_featuress1  
         ORDER BY VECTOR_DOT_PRODUCT(descriptionss_vectors, TO_VECTOR(:search_vector)) DESC
    """)
    results = conn.execute(sql, {'search_vector': str(search_vector)}).fetchall()
    results_df = pd.DataFrame(results, columns=df.columns).iloc[:, :-1] # Remove vector
    pd.set_option('display.max_colwidth', None)  # Easier to read description
     #results_df.head()
    song_names = results_df['SongName'].tolist()
    singer_names = [extract_singer(name) for name in song_names]
    mp3_files = [f for f in os.listdir(folder_path) if f.endswith('.mp3') and any(singer.lower() in f.lower() for singer in singer_names)]
    for file in mp3_files:
        full_path = os.path.join(folder_path, file)
        # pygame.mixer.music.load(full_path)
        print(f"Playing {file}...")
        # pygame.mixer.music.play()
        time.sleep(10)
        # pygame.mixer.music.stop()
