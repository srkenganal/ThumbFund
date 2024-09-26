import express from "express";
const usersRouter =  require("./routes/users");
const workersRouter  = require("./routes/workers");
const cors = require("cors");
const PORT = 3008;


const app = express();

app.use(cors())

app.use(express.json());
app.use('/v1/users', usersRouter);
app.use('/v1/workers', workersRouter);


app.listen(PORT, () => {
    console.log(`Server listing at port : ${PORT}`);
})

