var express = require("express");
var mongoose = require("mongoose");
const session = require("express-session");
var path = require("path");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

var login = "admin@biblioteca.br"
var password = "admin"

app.listen(port, () => {
    console.log("servidor na porta " + port)
});

mongoose.connect("mongodb+srv://usuario:senha@cluster0.gcljv.mongodb.net/biblioteca?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

const Livros = mongoose.model("livros", {
    nome: String,
    autor: String,
    editora: String,
});


app.get("/", (req, res) => {
    res.render("index");
});

app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({secret: "parametro"}));
app.set("view engine", "ejs");
app.set("views", __dirname, "/views");
app.use(express.urlencoded());
app.use(express.json());

app.use(express.static(__dirname + '/public'));

app.get("/livros", (req, res) => {
    let consulta = Livros.find({}, (err, livros) => {
        if (err)
            return res.status(500).send("Erro ao consultar livros")
        res.render("livros", { lista_livros: livros })
    });

});

app.get("/livrosUsuario", (req, res) => {
    let consulta = Livros.find({}, (err, livros) => {
        if (err)
            return res.status(500).send("Erro ao consultar livros")
        res.render("livrosUsuario", {lista_livros: livros})
    });

});


app.post("/", (req, res)=>{
    if(req.body.password == password && req.body.login == login){
        //logado com sucesso
        req.session.login = login;
        res.redirect("/livros")
    }else{
    res.redirect("/livrosUsuario");
};
});


app.get("/", (req, res) =>{

    if(req.session.login){
        res.render("livros")
    }else{
        res.render("login");
}
});

app.get("/cadastroLivros", (req, res) => {
    res.render("formlivros");
});

app.post("/cadastroLivros", (req, res) => {
    let livros = new Livros();

    livros.nome = req.body.nome;
    livros.autor = req.body.autor;
    livros.editora = req.body.editora;

    livros.save((err) => {
        if (err)
            return res.status(500).send("Erro ao cadastrar livro")

        return res.redirect("/livros");
    });
});

app.get("/editarLivros/:id", (req, res) => {
    Livros.findById(req.params.id, (err, livro) => {
        if (err)
            return res.status(500).send("Erro ao editar livro")
        res.render("formEditarLivros", { item: livro })
    })
})

app.post("/editarLivros", (req, res) => {
    var id = req.body.id;
    Livros.findById(id, (err, livros) => {
        if (err)
            return res.status(500).send("Erro ao consultar livro")
        livros.nome = req.body.nome;
        livros.autor = req.body.autor;
        livros.editora = req.body.editora;
 
        livros.save(err => {
            if (err)
                return res.status(500).send("Erro ao salvar livro")

            return res.redirect("/livros");
        })
    })
})

app.get("/deletarLivros/:id", (req, res) => {
    var livro_params = req.params.id;
    Livros.deleteOne({ _id: livro_params }, (err, result) => {
        if (err)
            return res.status(500).send("Erro ao excluir registro")
    })
    res.redirect("/livros");
})

app.get("/pesquisa", (req, res) => {
    let valor = req.query.sh; // ele recebe o name da box pesquisa 
    let campo = req.query.campo;

    qr = `{ "${campo}": { "$regex": "${valor}", "$options": "i" } }`;
    let qro = JSON.parse(qr);
    let item = Livros.find(qro, (err, itens) => { //i não diferencia maiusculas e minusculas, insensitive case

        if (err) {
            return res.status(500).send("Erro ao pesquisar livros");
        }
        else {
            res.render("livros", { lista_livros: itens });
        }
    });

});


