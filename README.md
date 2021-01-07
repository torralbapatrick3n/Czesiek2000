# Gitlab badges info
This project is made for users of Gitlab repository. This is simple nodejs server that will get data from gitlab api for your user and return json object with data of your project. You can then easily use this data inside [shields.io](shields.io) url and query values that you want to display in your project badges.

## Usage
Project is hosted on heroku, and web adress to this projects is: https://gitlab-badges-info.herokuapp.com/badge

It will return json object
```json
{
    "projectId": 23720033,
    "commits": "67", // need token for this
    "branch": "master",
    "forks": 0,
    "stars": 0,
    "wiki": "enabled",
    "topics": 0,
    "lastCommit": "November 3, 2021", // check diffrent formating below
    "repositorySize": "12.027166 MB", // need token for this
    "storageSize": "48.587778 MB", // need token for this
    "snippetsSize": "0 MB", // need token for this
    "jobArtifacts": "36.560612 MB", // need token for this
    "licence": "MIT" // need specify in url
}
```

## Url parameters
Url requires two parameters:
* projectId - id of project
* username - your gitlab username
* token - your gitlab token when you want to access private data (optional)
* license - specify license of project (optional)
* format - specify format of date (optional)

You need to generate access token in your gitlab settings. You can do it by clicking profile icon in the right corner of the page, then click prefences, then click access tokens. Fill forms on the page then create personal access token button will get in color, so click it and generate access token.

Format of date has three options:
* 0 - date will be in format: "3/11/2021"
* 1 - date will be in format: "03/11/2021 11:11"
* 2 - will display how long ago last commit was made
* 3 - date will be in format "November 3, 2021"
When you not pass format value, it will be displayed in format 2021-03-11

## Url examples
Base url of this project is https://gitlab-badges-info.herokuapp.com/badge
Basic url can look like this
```
https://gitlab-badges-info.herokuapp.com/badge?id=23720033&username=Czesiek2000&token=<YOUR_TOKEN>&licence=MIT
```

To use diffrent date format just add format parameter to url, if nothing is passed there will be used default format
```
https://gitlab-badges-info.herokuapp.com/badge?id=23720033&username=Czesiek2000&token=<YOUR_TOKEN>&licence=MIT&format=1
```