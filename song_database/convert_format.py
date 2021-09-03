# Python code to
# demonstrate readlines()
 
# Using readlines()
s = "abc"
for c in s:
    file1 = open('recording_splitb' + c, 'r')
    Lines = file1.readlines()
     
    songs = []
    # Strips the newline character
    for line in Lines:
        song_array = line.strip().split("\t")
        if(len(song_array) > 2 and song_array[2] != "[untitled]"):
            songs.append(song_array[2] + "\n")

    file1.close()

    file2 = open('songsb' + c + ".txt", 'w')
    file2.writelines(songs)
    file2.close()
