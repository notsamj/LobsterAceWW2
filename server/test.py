# Credit https://stackoverflow.com/questions/13902805/list-of-all-unique-characters-in-a-string
char_seen = []
myString = input()
for char in myString:
    if char not in char_seen:
        char_seen.append(char)
print(''.join(char_seen))