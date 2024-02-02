# CineSyncHub
###  _Overview_
Welcome to CineSyncHub, your go-to hub for discovering movies and finding out where to stream them. Simply type in the name of a movie, and CineSyncHub will provide you with detailed movie information and a list of available streaming platforms.

#### _How it Works_

##### Home Page Interaction:

When a user visits the home page, they are greeted with a user-friendly form.

##### Form Submission and First API Request (OMDb): 

After submitting the form, the server initiates the first API request to OMDb (Open Movie Database) to fetch detailed information about the specified movie.
##### Parsing OMDb Response and Second API Request (Watchmode): 

Upon receiving the OMDb response, the server intelligently parses the data and seamlessly generates a synchronous request to the Watchmode API for streaming details.
##### Parsing Watchmode Response and Results Delivery:

The server interprets the Watchmode API response, providing comprehensive information about where the movie is available for streaming.

### APIs Used
##### OMDb (Open Movie Database): 
Provides detailed movie information.
##### Watchmode:
Offers streaming details for the specified movie.

### Getting Started
Ready to explore CineSyncHub? **Follow these steps:**

Clone the repository: ```git clone https://github.com/your-username/CineSyncHub.git```

Navigate to the project directory: ```cd CineSyncHub```

✨Explore✨
