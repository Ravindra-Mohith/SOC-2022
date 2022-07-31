# SOC-2022:
  Whooo...!! its a long journey i went through i have never leanrt these many things in such a small period of time. this journey made me confident that i can build a MEAN full stack website or a SSR(server side rendered website using NODE express mongoDB and PUG/Handlebars view engines) from scratch.

1.Angular App:
  I did this app by creating angular basic abstracts... This is actually a news web app which sorts in according to the news type.
  I collected the API from newsAPI.org which provides free data APIs.From that i imported http client and I used get requests to extract data and keeping onto screen with beautiful UI.
  
2.MEAN app:
  firstly, hit `npm i` to install all node_modules.Go to parent repo and hit nodemon server.js to run backend. In other terminal, hit `ng serve` to run frontend. this is a basic full stack app which connects to your local mongo db, and does the CRUD operations through backend(EXPRESS.js) with help of beautiful frontend UI(ANGULAR.js).

3.Server side rendered web(Node express mongoDB,Pug):
This app is made by purely MVC architecture.
   Basically,this app,contains tour,user,review models in it.Firstly, hit `npm i` to install all node_modules.And the hit `nodemon server.js`
   I built a beautiful server that can do many trending situaltions such as getting access through only authorization(user login access), tour CRUD(only through auth) in mongo DB,and even user CRUD(only if user is logged in),and in emeergency situaltions such as reset password, forgot password via mailing in mailtrap.com,and then, reviews CRUD operations(auth), only if u are an admin you can delete reviews and tours.I wrote many middlewares such as basic app middlewares for security and parsing puprposes, and then jwt middlewares for getting user access to do such permissions, and then mongoose middlewares for MongoDb manpulations.User many cool feauters in building this server using MVC architecture.You can view all my routes in routes folder to access every route in my server.And then, coming to the UI part, i user "PUG" view engine for view templates using public static directory applying universal css styles and js bundles to do all functions of templates.Im working in signup and admin part in UI(I completed in server side but hadn't rendered yet).
