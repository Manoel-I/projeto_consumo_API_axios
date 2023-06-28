const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require('cors');
const jwt = require('jsonwebtoken');

const JWTSecret = "segredoDoManoel";

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

function auth(req, res, next){
    const authToken = req.headers['authorization'];
    let bearer_array = authToken.split(' ');
    let token = bearer_array[1];

    jwt.verify(token, JWTSecret, (error, data)=>{
        if(error){
            res.status(401);
            res.json({error : "Invalid token"});
        }else{
            req.token = token;
            req.loggedUser = {id : data.id, email : data.email};
            next();
        }
    });
}

var DB = {
    games: [
        {
            id: 23,
            title: "Call of duty MW",
            year: 2019,
            price: 60
        },
        {
            id: 65,
            title: "Sea of thieves",
            year: 2018,
            price: 40
        },
        {
            id: 2,
            title: "Minecraft",
            year: 2012,
            price: 20
        }
    ],
    users:[
        {
            id: 1,
            name: "manoel",
            email: "manoel.bcneto@gmail.com.br",
            password: "Manu333opaNode"
        }
    ]
}

app.get("/games",auth,(req, res) => {
    res.statusCode = 200;
    res.json(DB.games);
});

app.get("/game/:id",(req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        
        var id = parseInt(req.params.id);

        var game = DB.games.find(g => g.id == id);

        if(game != undefined){
            res.statusCode = 200;
            res.json(game);
        }else{
            res.sendStatus(404);
        }
    }
});

app.post("/game",(req, res) => { 
    var {title, price, year} = req.body;
    var randomNumber = Math.floor(Math.random() * 99999);
    if(randomNumber == 0){
        randomNumber = Math.floor(Math.random() * 99999);
    }
    DB.games.push({
        id: randomNumber,
        title,
        price,
        year
    });
    res.sendStatus(200);
})

app.delete("/game/:id",(req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);
        var index = DB.games.findIndex(g => g.id == id);

        if(index == -1){
            res.sendStatus(404);
        }else{
            DB.games.splice(index,1);
            res.sendStatus(200);
        }
    }
});

app.put("/game/:id",(req, res) => {

    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        
        var id = parseInt(req.params.id);

        var game = DB.games.find(g => g.id == id);

        if(game != undefined){

            var {title, price, year} = req.body;

            
            if(title != undefined){
                game.title = title; 
            }

            if(price != undefined){
                game.price = price;
            }

            if(year != undefined){
                game.year = year;
            }
            
            res.sendStatus(200);

        }else{
            res.sendStatus(404);
        }
    }

});

app.post('/auth', (req, res)=>{
    let {email, password} = req.body;

    if(email != undefined){
        let user = DB.users.find(user => user.email == email);
        if(user != undefined){
            if(user.password == password){

                // payload do token 
                jwt.sign({id : user.id, email: user.email},JWTSecret,{expiresIn: '1h'}, (error, token)=>{   
                    if(error){
                        res.status(400);
                        res.json({error : "internal failure"});
                    }else{
                        res.status(200);
                        res.json({token : token });
                    }
                }); 
            }else{
                res.status(401);
                res.json({error : "invalid password"});
            }
        }else{
            res.status(404);
            res.json({error: "user not found"});
        }
    }else{
        res.status(400);
        res.json({error : "invalid email"})
    }
})


app.listen(8080,() => {
    console.log("API RODANDO!");
});