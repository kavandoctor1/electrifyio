const hopeful = ['Adele - Rolling in the Deep (Official Music Video).mp3', 'Adele - Someone Like You (Official Music Video).mp3', 'Coldplay - Fix You (Official Video).mp3', 'Katrina and The Waves - Walking On Sunshine (Official Music Video).mp3', 'Lizzo - Good As Hell (Video).mp3', '[HD] Pearl Jam - Black [Pinkpop 1992].mp3']

const happy = ['Katrina and The Waves - Walking On Sunshine (Official Music Video).mp3', 'The Black Eyed Peas - I Gotta Feeling (Official Music Video).mp3',"CAN'T STOP THE FEELING! (from DreamWorks Animation's _TROLLS_) (Official Video).mp3","Mark Ronson - Uptown Funk (Official Video) ft. Bruno Mars.mp3"]

const sad = ['Adele - Rolling in the Deep (Official Music Video).mp3', 'Adele - Someone Like You (Official Music Video).mp3', 'Eric Clapton - Tears In Heaven (Official Video).mp3', '[HD] Pearl Jam - Black [Pinkpop 1992].mp3']

const celebrate = ['Abba - Dancing Queen (Official Music Video Remastered).mp3', 'Katrina and The Waves - Walking On Sunshine (Official Music Video).mp3', 'Lizzo - Good As Hell (Video).mp3', 'The Black Eyed Peas - I Gotta Feeling (Official Music Video).mp3']

const nextsong = {
    'happy': ['happy','happy', 'celebrate', 'sad'],
    'hopeful': ['hopeful','hopeful', 'celebrate', 'happy'],
    'celebrate': ['celebrate','hopeful', 'celebrate', 'sad'],
    'sad': ['happy','hopeful', 'sad', 'sad'],
}

const songs = {
    'happy':happy,
    'hopeful': hopeful,
    'celebrate': celebrate,
    'sad': sad,
}

function randompick(array){
    var index = Math.floor(Math.random() * array.length);
    return array[index];
}
function playMusic(mood){
    var song = randompick(songs[mood]);  
    var audio = new Audio('NewSongs/'+song);
    var value =  Math.random()*20 + 10;
    console.log(value);
    
    audio.currentTime = value;
    audio.play();
    setTimeout(function() {
      audio.pause(); // Stop playing after 10 seconds
       // Optionally, reset audio to start position
        var nextmood = randompick(nextsong[mood]);
        playMusic(nextmood);

    }, 15000); 
  
  
  }
  