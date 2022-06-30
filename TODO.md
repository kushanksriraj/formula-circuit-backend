see the express paging repl and use some optimizations here

1. use express.JSON
2. use lodash union
3. give default value to bio, profileURL, followingList, followerList.etc, so that you don't have to keep sending them
4. check if user is present in middleware only, just check, don't send user data to controller