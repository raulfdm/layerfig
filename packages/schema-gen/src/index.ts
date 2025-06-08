try {
	throw new Error("FOO");
} catch (err) {
	console.log(err.message);
}
