# eventnotifier-authService
Authentication service for eventnotifier-application.

JSON API:
POST /users/ - create a new user
params: { username: 'username', password: 'userpassword'}

POST /sessions/ - log in a user
params: { username: 'username', password: 'userpassword'}
On a successful login returns a JWT-token to be used as HTTP-authorization Bearer.

GET /sessions/:sessionKey - get a specific ession

DELETE /sessions/:sessionKey - log out a session
