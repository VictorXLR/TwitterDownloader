# TwitterDownloader
A quick project to serve mp4 links for apple shortcuts, which allows me to download videos from Twitter.com 


### Generate Token
Create a Twitter developer app using an application's `CONSUMER API KEY` and `CONSUMER API SECRET` keys.. 

Command to run is 
```bash
curl -u 'API key:API secret key' \
  --data 'grant_type=client_credentials' \
  'https://api.twitter.com/oauth2/token'
```