

# **ArcadeCity**



![](https://i.pinimg.com/originals/e1/10/6b/e1106b3119e421fd32c2f3664ad42a32.jpg)



## Description



​	ArcadeCity is a platform to find and list existing and playable retro videogame arcade machines all around the world. Find arcade cabinets in your area, discover and list them.

​	Join now the ArcadeCity community!



## User Stories



- As a guest I can see a 404 page if I try to reach a page that does not exist
- As a guest, I want to find arcade machines directly on the home page
- As a guest, I want to be able to search for arcade machines using my custom criteria on the home page
- As a guest, I want to be able to view available arcade machines that fit my search criteria on the search results page
- As a guest, I want to be able to view the search result located on a map by geolocation on the search results page
- As a guest, I want to be able to update the search criteria on the search results page
- As a user, I want to be able to create, edit and delete my account on my account page
- As a user, I want to be able to authenticate myself on the authentication page
- As a user, I want to be able to create, edit and delete my finds on my found arcades page
- As a user, I want to be able to save arcades, rate and make comments about a cabinet on the arcade page
- As a user, I want to be able to view my saved arcades on my profile page
- As a user, I want to be able to familiarize with the answers to frequently asked questions on the FAQ page



## Backlog



- Update the existing search function with more criteria and scenarios

- Add tournaments and design the pages

- Add direct messages

- Add review model and implement review system

  



# Client / Frontend



## React Router Routes (React App)



| Path                      | Component         | Permissions                | Behavior                                                     |
| ------------------------- | ----------------- | -------------------------- | ------------------------------------------------------------ |
| `/`                       | HomePage          | public `<Route>`           | Home page                                                    |
| `/search`                 | SearchPage        | public `<Route>`           | Search results for arcade machines                           |
| `/search/arcade/:id`      | ArcadeDetailsPage | public `<Route>`           | Arcade details, read-only comments                           |
| `/signup`                 | SignupPage        | anon only `<AnonRoute>`    | Signup form, link to login, navigate to homepage after signup |
| `/login`                  | LoginPage         | anon only `<AnonRoute>`    | Login form, link to signup, navigate to homepage after login |
| `/me`                     | ProfilePage       | user only `<PrivateRoute>` | Shows user details and listed found arcades                  |
| `/me/edit`                | EditProfilePage   | user only `<PrivateRoute>` | Edits user profile                                           |
| `/me/arcadelist/add`      | ListArcadePage    | user only `<PrivateRoute>` | Create New Found Arcade                                      |
| `/me/arcadelist/edit/:id` | EditArcadePage    | user only `<PrivateRoute>` | Edit Information for Found Arcade                            |
| `/favourites`             | FavouritesPage    | user only `<PrivateRoute>` | List of favourite Arcade Machines                            |
| `/about`                  | AboutPage         | public `<Route>`           | FAQs                                                         |
| `/search/player/:id`      | PlayerTwoPage     | user only `<PrivateRoute>` | Shows player details and connect (BACKLOG)                   |



## Components (Mobile App)



- HomePage
- SearchPage
- ArcadeDetailsPage
- SignupPage
- LoginPage
- ProfilePage
- EditProfilePage
- ListArcadesPage
- EditArcadesPage
- FavouritesPage
- AboutPage
- PlayerTwoPage  ***(Backlog Feature)***

- MyTournamentsPage  ***(Backlog Feature)***

  



## Services



- Auth Service

  

- Api Service

  

- Tournament Service ***(Backlog)***

  



# Server / Backend



## Models



**Player Model** 

```User {
{
     "player": { type: String, required: true, unique: true },
     "email": { type: String, require: true, unique: true },
     "password": {type: String, required: true},
     "avatarImg": String,
     "favourites": [{type: Schema.Types.ObjectId, ref:"Arcade"}],
     "hasFound": Boolean,
     "listedArcades": [{type: Schema.Types.ObjectId, ref:"Arcade"}],
     "rankings": [{type: Schema.Types.ObjectId, ref:"HighestScore"}]
}
```

  

**Arcade Model**

```
{	
	"game": {type: String, required: true},
    "description": String,
    "maxPlayers": Number,
    "isEmulated": Boolean,
    "rating": [{type: Number, min: 0, max: 10}],
    "isActive": Boolean,
    "coins": Number,
    "yearReleased": Number,
    "highestScores": [{type: Schema.Types.ObjectId, ref:"HighestScore"}],
    "gallery": {type: String, required: true},
    "hunterId": {type: Schema.Types.ObjectId, ref:"Player"},
    "location": {
        type: {
          type: String
        },
        coordinates: [Number]
      },
    "contactInfo": String,
    "address": {type: String, required: true},
    "city": {type: String, required: true},
    "comments": [{
    		"type": String,
    		"commentBy": {type: Schema.Types.ObjectId, ref:"Player"}
    		}]
}
```



HighestScore Model

```
{ 
 	"score": {type:Number, default: 0},
 	"arcade": {type: Schema.Types.ObjectId, ref:"Arcade"},
    "scoredBy": {type: Schema.Types.ObjectId, ref:"Player"}
}
```



## API Endpoints (backend routes)



| HTTP Method | URL                                | Request Body              | Success status | Error Status | Description                                                  |
| ----------- | ---------------------------------- | ------------------------- | -------------- | ------------ | ------------------------------------------------------------ |
| POST        | `/auth/signup`                     | {player, email, password} | 201            | 404          | Checks if fields are not empty (422) and user not exists (409), then create user with encrypted password, and store user in session |
| POST        | `/auth/login`                      | {email, password}         | 200            | 401          | Checks if fields not empty (422), if user exists (404), and if password matches (404), then stores user in session |
| GET         | `/auth/logout`                     | Saved session             | 204            | 400          | Check if user is logged in and logs out the user             |
| GET         | `/api/player/me`                   | Saved session             | 200            | 404          | Check if user is logged in and return profile page. By React App to set the auth state |
| PUT         | `/api/player/me`                   | {avatarImg}               | 200            | 400          | Check if user is logged in and update profile picture.       |
| PUT         | `/api/player/favourites`           | Saved session             | 200            | 400          | Check if user is logged in and add arcade to favourites      |
| POST        | `/api/player/favourites`           | Saved session             | 200            | 400          | Check if user is logged in and remove arcade from favourites |
| GET         | `/api/arcades/search/:city`        | {req.params}              | 200            | 404          | Returns arcades by search query                              |
| POST        | `/api/arcades`                     | Arcade model              | 200            | 401          | Create an Arcade Entry                                       |
| GET         | `/api/arcades/:id`                 | {id}                      | 200            | 400          | Show an specific arcade                                      |
| DELETE      | `/api/arcades/:id`                 | {id}                      | 204            | 400          | Delete listed arcade of the currently logged in user         |
| PUT         | `/api/arcades/:id/comments`        | {comments}                | 200            | 400          | Add comments                                                 |
| PUT         | `/api/arcades/:id/highest-scores/` | {score, arcade}           | 200            | 400          | Add new highest score                                        |



## Links

### Trello/Kanban

[Trello board](https://trello.com/b/PBqtkUFX/curasan) 

### Wireframes

[Miro board](https://miro.com/app/board/o9J_lbjQGRU=/)

### Git

The url to the repository and to the deployed project

[Client repository Link](https://github.com/ArmaghX930/ArcadeCity-Client)

[Server repository Link](https://github.com/ArmaghX930/ArcadeCity-Server)

[Deployed App Link](https://arcade-city.herokuapp.com/)

### Slides

The url to your presentation slides

[Slides Link](https://docs.google.com/presentation/d/1y3e_2pzePzha55c3NGjmt9uP5dnz17JV5IH9UX0z6Jo/edit#slide=id.p)