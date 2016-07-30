(function() {
	var playerTables = document.getElementsByTagName('table');

	for(var i in playerTables) {
		if(playerTables.hasOwnProperty(i)) {
			console.log(playerTables[i], typeof playerTables[i]);
		}
	}

})();