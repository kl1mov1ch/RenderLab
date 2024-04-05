const express = require('express');
const expressHandlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const handlebars = expressHandlebars.create({
	defaultLayout: 'main',
	extname: 'hbs',
	helpers: {
		exit: () => {
			return `document.location='/'`;
		}
	}
});

const app = express();

app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');

const publicPath = path.join(__dirname, 'views', 'public');
app.use(express.static(publicPath));
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});

// Функция для загрузки данных из JSON-файла
function loadUsers() {
	const usersData = fs.readFileSync('db.json', 'utf8');
	return JSON.parse(usersData);
}

// Функция для сохранения данных в JSON-файл
function saveUsers(users) {
	fs.writeFileSync('db.json', JSON.stringify(users, null, 2), 'utf8');
}

app.get('/', async (req, res) => {
	try {
		const users = loadUsers();
		res.render("main", { users, clickable: false });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});

app.get('/update', async (req, res) => {
	try {
		const users = loadUsers();
		const user = users.find(elem => elem.id === parseInt(req.query.id));
		res.render("update", { users, user, clickable: true });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});

app.get('/add', async (req, res) => {
	try {
		const users = loadUsers();
		res.render("add", { users, clickable: true });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});

app.post('/add', async (req, res) => {
	try {
		const { name, number } = req.body;
		const users = loadUsers();
		const newUser = { id: users.length + 1, name, number };
		users.push(newUser);
		saveUsers(users);
		res.redirect('/');
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});

app.post('/update/:id', async (req, res) => {
	try {
		const { name, number } = req.body;
		const { id } = req.params;
		const users = loadUsers();
		const updatedUser = { id: parseInt(id), name, number };
		const updatedUsers = users.map(user => (user.id === updatedUser.id ? updatedUser : user));
		saveUsers(updatedUsers);
		res.redirect('/');
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});


app.post('/delete/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const users = loadUsers();
		const filteredUsers = users.filter(user => user.id !== parseInt(id));
		saveUsers(filteredUsers);
		res.json({ success: true });
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});
