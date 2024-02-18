from pydub import AudioSegment
import os

# Directory containing the original .mp3 files
source_dir = 'Songs/'
# Directory where the compressed first minute of each song will be saved
target_dir = 'NewSongs/'
hopeful = ['Adele - Rolling in the Deep (Official Music Video).mp3', 'Adele - Someone Like You (Official Music Video).mp3', 'Coldplay - Fix You (Official Video).mp3', 'Katrina and The Waves - Walking On Sunshine (Official Music Video).mp3', 'Lizzo - Good As Hell (Video).mp3', '[HD] Pearl Jam - Black [Pinkpop 1992].mp3']

happy = ['Katrina and The Waves - Walking On Sunshine (Official Music Video).mp3', 'The Black Eyed Peas - I Gotta Feeling (Official Music Video).mp3',"CAN'T STOP THE FEELING! (from DreamWorks Animation's _TROLLS_) (Official Video).mp3","Mark Ronson - Uptown Funk (Official Video) ft. Bruno Mars.mp3"]

sad = ['Adele - Rolling in the Deep (Official Music Video).mp3', 'Adele - Someone Like You (Official Music Video).mp3', 'Eric Clapton - Tears In Heaven (Official Video).mp3', '[HD] Pearl Jam - Black [Pinkpop 1992].mp3']

celebrate = ['Abba - Dancing Queen (Official Music Video Remastered).mp3', 'Katrina and The Waves - Walking On Sunshine (Official Music Video).mp3', 'Lizzo - Good As Hell (Video).mp3', 'The Black Eyed Peas - I Gotta Feeling (Official Music Video).mp3']


all = hopeful + happy + sad + celebrate
# Create the target directory if it doesn't exist
os.makedirs(target_dir, exist_ok=True)

# Iterate over every file in the source directory
for filename in os.listdir(source_dir):
    onlyname = filename
    if '/' in onlyname:
        onlyname = onlyname.split('/')[-1]
    if filename.endswith('.mp3') and onlyname in all:
        # Construct the full path to the source file
        file_path = os.path.join(source_dir, filename)
        # Load the .mp3 file
        song = AudioSegment.from_mp3(file_path)
        # Get the first 60 seconds (60000 milliseconds) of the song
        first_minute = song[:60000]
        # Optional: Apply compression here if needed. This example just trims the song.
        # Save the compressed first minute to the target directory
        first_minute.export(os.path.join(target_dir, filename), format='mp3')

print("Processing complete.")
