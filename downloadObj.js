function downloadObj(obj) {
	function convertPlayersObj(obj) {
		var playerArr = [],
			positionsAdded = [];
		$.each(obj, function(i, el) {
			if(positionsAdded.indexOf(i) === -1) {
				positionsAdded.push(i);
				playerArr.push([i]);
			}
			el.forEach(function(elem) {
				playerArr.push([elem.name, elem.team, elem.points, elem.cost])
			});
		});
		return playerArr;
	}

	function arrToCSV(arr) {
		var csvContent = "data:text/csv;charset=utf-8,";
		arr.forEach(function(infoArray, index){
		   dataString = infoArray.join(",");
		   csvContent += index < arr.length ? dataString+ "\n" : dataString;
		});

		return csvContent;
	}

	function downloadCSV(csvContent) {
		var encodedUri = encodeURI(csvContent),
			link = document.createElement("a");

		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "Week00.csv");

		link.click();
	}

	downloadCSV(arrToCSV(convertPlayersObj(obj)));
}