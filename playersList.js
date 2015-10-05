$(document).ready(function() {
	function getWeeksScores(el) {
		$.ajax('weeklyscores/'+el.val(), {
			success:function(response) {
				var players = formatPlayers($.csv.toArrays(response));

				//Run all queries
				(function() {
					var position, query, curPlayers;

					$('.suggestions > div > input').each(function(i, el) {
						position = players[$(el).prop('id')];
						query = $(el).val().toLowerCase();
						curPlayers = playerSearch(position, query);

						if(curPlayers.length > 0) {
							displayPlayers($(el).prop('id'), curPlayers);
							calculateVORP($(el).siblings('label').text().toLowerCase());
						}
					});
				})();
				/* Format numbers with commas */
				function formatNumber(nStr) {
				  nStr += '';
				  x = nStr.split('.');
				  x1 = x[0];
				  x2 = x.length > 1 ? '.' + x[1] : '';
				  var rgx = /(\d+)(\d{3})/;
				  while (rgx.test(x1)) {
				    x1 = x1.replace(rgx, '$1' + ',' + '$2');
				  }
				  return x1 + x2;
				}
				function formatPlayers(playersArr) {
					var players = {},
						positions = ['goalkeepers', 'defenders', 'midfielders', 'forwards'],
						curPos;

					playersArr.forEach(function(row) {
						if(row[0] !== 'Player' && row[1] !== 'Team' && row[0] !== '') {
							if(positions.indexOf(row[0]) > -1 && typeof players[row[0]] === 'undefined') {
								curPos = row[0];
								players[row[0]] = [];
							}
							else if(positions.indexOf(row[0]) === -1) {
				console.log('adding', row, row[3], row[3].slice(1));

								//Check if this player has already been added, the fpl list sometimes has duplicats
								if(isNaN(parseFloat(row[3]))) row[3] = row[3].slice(1);
				console.log('pushing', new Player(row));

								players[curPos].push(new Player(row));
							}
						}
					});

					return players;
				}
				//Player class
				function Player(el) {
					this.name = null;
					this.team = null;
					this.points = null;
					this.cost = null;
					this.val = null;

					if(Object.prototype.toString.call(el) === '[object Array]') {
						this.name = el[0];
						this.team = el[1];
						this.points = el[2];
						this.cost = el[3];
					}
					else {
						this.name = $(el).find('td:nth-child(1)').text();
						this.team = $(el).find('td:nth-child(2)').text();
						this.points = $(el).find('td:nth-child(3)').text();
						this.cost = $(el).find('td:nth-child(4)').text().replace(/\D/, '');
					}

					this.val = round(this.points / this.cost);
				}
				Player.prototype.get = function(prop) {
					if(typeof this.prop !== 'undefined') {
						return this[prop];
					}
					else {
						return 'unknown property '+prop;
					}
				}
				function displayPlayerOption(player) {
					console.log('displaying', player);
				}
				function playerSearch(position, query) {
					if(isNaN(parseFloat(query))) {
						return position.filter(function(pl) {
							if(pl.name.toLowerCase().indexOf(query) > -1 || 
										pl.team.toLowerCase().indexOf(query) > -1) {
								return true;
							}
						});
					}
					else {
						//Search for minimum score or points
						query = parseFloat(query);
						return position.filter(function(pl) {
							if(query < 14) {
								//Assumed cost
								if(pl.cost <= query) {
									return true;
								}
							}
							else {
								//Assumed points
								if(pl.points <= query) {
									return true;
								}
							}
						});
					}
				}
				function keyUpOnInput(e) {
					if((e.keyCode > 45 && e.keyCode < 91) || (e.keyCode >= 8 && e.keyCode <= 13)) {
						var position = players[$(this).prop('id')],
							query = $(this).val().toLowerCase();
						curPlayers = playerSearch(position, query);

						if(curPlayers.length > 0) {
							displayPlayers($(this).prop('id'), curPlayers);
						}
					}
				}
				function sortTeam(team, stat, highLow) {
					if(typeof stat === 'undefined') stat = 'points';
					highLow = typeof highLow === 'undefined' ? 'highLow' : 'lowHigh';

					if(Object.prototype.toString.call(team) === '[object Object]') {
						$.each(team, function(i, el) {
							team[i] = el.sort(function(a, b) {
								if(highLow === 'highLow') {
									return a[stat] < b[stat] ? 1 : -1;
								}
								else {
									return a[stat] > b[stat] ? 1 : -1;
								}
							});
						});

						return team;
					}
					else if(Object.prototype.toString.call(team) === '[object Array]') {
						return team.sort(function(a, b) {
							if(highLow === 'highLow') {
								return a[stat] < b[stat] ? 1 : -1;
							}
							else {
								return a[stat] > b[stat] ? 1 : -1;
							}
						});
					}
				}
				function displayPlayers(position, players) {
					//Empty the associated player container
					$('.suggestions div.'+position.slice(0,1)).children('.player:not(.heading)').remove();

					//Sort the players array from highest to lowers value
					players = sortTeam(players, 'val');

					$.each(players, function(i, el) {
						$('.suggestions div.'+position.slice(0,1)).append(playerToDom(el, 'player'));
					});
				}
				function playerToDom(player, divClass) {
					if(typeof divClass === 'undefined') divClass = '';

					var playerCon = $(document.createElement('div')).addClass(divClass)
									.append($(document.createElement('span')).text(player.name).addClass('long'))
									.append($(document.createElement('span')).text(player.team).addClass('long'))
									.append($(document.createElement('span')).text(player.points))
									.append($(document.createElement('span')).text(player.cost))
									.append($(document.createElement('span')).text(player.val));

					return playerCon;
				}
				function round(n) {    
			    return +(Math.round(n + "e+2")  + "e-2");
				}
				function selectReplacement() {
					var selection = {
						name: $(this).children(':nth-child(1)').text(),
						team: $(this).children(':nth-child(2)').text(),
						points: $(this).children(':nth-child(3)').text(),
						cost: $(this).children(':nth-child(4)').text(),
						val: $(this).children(':nth-child(5)').text()
					};

					$(this).siblings('.replacement').replaceWith(playerToDom(selection, 'replacement'));
					$(this).siblings('.replacement').prepend(
						$(document.createElement('h3')).text('Replacement Player'),
						$(document.createElement('span')).text('x').addClass('clear-selection')).addClass('show');

					calculateVORP($(this).siblings('label').text().toLowerCase());
				}
				function clearSelectedReplacement() {
					$(this).closest('div').siblings('.player-suggestion').remove();
					$(this).closest('div').html('').removeClass('show');
				}
				function calculateVORP(position) {
					if(!$('.suggestions div.'+position.slice(0,1)+' div.replacement').hasClass('show')) return;

					var repCon = $('div.'+position.slice(0,1)+' div.replacement'),
						repPlayer = {
							name: repCon.children(':nth-child(3)').text(),
							team: repCon.children(':nth-child(4)').text(),
							points: parseInt(repCon.children(':nth-child(5)').text()),
							cost: parseFloat(repCon.children(':nth-child(6)').text()),
							val: parseFloat(repCon.children(':nth-child(7)').text())
						},
						top5 = [];

					//Get the top five choices within 1 mill
					players[position].forEach(function(pl) {
						if(parseFloat(pl.cost) >= repPlayer.cost - 1 && parseFloat(pl.cost) <= repPlayer.cost + 1) {
							if(top5.length < 5) {
								top5.push(pl);
							}
							else {
								//Check if this player has a higher plus val than one of the current top 5
								var betterThan = [];
								top5.forEach(function(el, i) {
									if(parseFloat(pl.val) > parseFloat(el.val)) betterThan.push(i);
								});

								if(betterThan.length > 0) {
									//Get the worst of the top 5 players this one is better than
									var worst = betterThan.reduce(function(p, c) {
										return parseFloat(top5[p].val) < parseFloat(top5[c].val) ? p : c;
									}, betterThan[0]);
									top5[worst] = pl;
								}
							}
						}
					});

					displayTop5(top5, position);
				}
				function displayTop5(players, position) {
					$('.player-suggestion').remove();

					var repCon = $('div.'+position.slice(0,1)+' div.replacement');

					players = sortTeam(players, 'val').reverse();

					players.forEach(function(pl) {
						repCon.after(playerToDom(pl, 'player player-suggestion'));
					});

					repCon.after($(document.createElement('h3')).text('Suggestions').addClass('player player-suggestion'));
				}
				function addDTPlayer(dreamTeam, position, player, stat) {
					if(typeof stat === 'undefined') stat = 'points';

					//Sort the current dream team
					dreamTeam = sortTeam(dreamTeam, stat);

					var add = false,
						found = false;
					switch(position) {
						case 'goalkeepers':
							var maxPlayers = 2;
							break;
						case 'defenders':
						case 'midfielders':
							var maxPlayers = 5;
							break;
						case 'forwards':
							var maxPlayers = 3;
							break;
					}

					if(dreamTeam[position].length < maxPlayers) {
						//There are not enough players yet so add this player
						dreamTeam[position].push(player);
					}
					else {
						dreamTeam[position].forEach(function(pl, i) {
							if(parseFloat(player[stat]) > parseFloat(pl[stat])) add = i;
							if(player.name === pl.name) found = true;
						});

						if(add !== false && found !== true) {
							dreamTeam[position][add] = player;
						}
					}
				}
				function calcTeamStats(team, type) {
					var stats;

					switch(type) {
						case 'val':
						case 'value':
							type = 'val';
							break;
						case 'points':
						case 'pts':
							type = 'points';
							break;
						case 'cost':
						case 'price':
							type = 'cost';
							break;
						default:
							type = 'all';
							stats = {
								val:0,
								points:0,
								cost:0
							};
					}

					$.each(team, function(pos, players) {
						players.forEach(function(player) {
							if(type === 'all') {
								stats.val += parseFloat(player.val);
								stats.points += parseFloat(player.points);
								stats.cost += parseFloat(player.cost);
							}
							else {
								stats += parseFloat(player[type]);
							}
						});
					});

					if(type === 'all') {
						stats.val = round(stats.val, 2);
						stats.points = round(stats.points, 2);
						stats.cost = round(stats.cost, 2);
					}
					else {
						stats = round(stats, 2);
					}

					return stats;
				}
				function inCurrentTeam(team, player) {
					var inTeam = false;
					if(Object.prototype.toString.call(team) === '[object Object]') {
						$.each(team, function(pos, players) {
							players.forEach(function(pl) {
								if(pl.name === player.name) inTeam = true;
							});
						});
					}
					else if(Object.prototype.toString.call(team) === '[object Array]') {
						team.forEach(function(pl) {
							if(pl.name === player.name) inTeam = true;
						});
					}

					return inTeam;
				}
				function replacePlayer(team, pair) {
					var curPlayerName = pair.current.name,
						replacement = pair.comp,
						repPos, repIndex;

					$.each(team, function(pos, players) {
						players.forEach(function(pl, i) {
							if(pl.name === curPlayerName) {
								repPos = pos;
								repIndex = i;
							}
						});
					});

					team[repPos][repIndex] = replacement;
				}
				function findBestPlayerPair(pairs, currentTeamCost, maxCost) {
					var possibleTeamCost,
						currentBestPair,
						currentDisparity,
						disparity;

					$.each(pairs, function(name, pair) {
						if(null !== pair.comp) {
							possibleTeamCost = currentTeamCost - (parseFloat(pair.current.cost) - parseFloat(pair.comp.cost));

							if(possibleTeamCost <= maxCost) {
								if(typeof currentBestPair === 'undefined') {
									currentBestPair = pair;
								}
								else if(currentBestPair !== 'undefined') {
									currentDisparity = parseFloat(currentBestPair.current.val) - parseFloat(currentBestPair.comp.val);
									disparity = parseFloat(pair.current.val) - parseFloat(pair.comp.val);

									if(disparity < currentDisparity) {
										currentBestPair = pair;
									}
								}
							}
						}
					});

					return currentBestPair;
				}
				function pairComparablePlayers(valueTeam) {
					valueTeam = sortTeam(valueTeam, 'points');

					var compPlayers = {};
					$.each(valueTeam, function(vPos, vPlayersArr) {
						vPlayersArr.forEach(function(vPl) {
							compPlayers[vPl.name] = {
								current: vPl,
								comp: null
							};
							$.each(players, function(pos, playersArr) {
								if(pos === vPos) {
									//Find the cheapest player in the array who is not already in the val team but is closest in score
									playersArr.forEach(function(pl) {
										if(parseInt(pl.points) > parseInt(vPl.points)) {
											if(!inCurrentTeam(valueTeam, pl)) {
												//Check if a comp player has been found yet
												if(null === compPlayers[vPl.name].comp) {
													compPlayers[vPl.name].comp = pl;
												}
												else if(parseFloat(pl.val) > parseFloat(compPlayers[vPl.name].comp.val)) {
													compPlayers[vPl.name].comp = pl;
												}
											}
										}
									});
								}
							});
						});
					});
					return compPlayers;
				}
				function clearTeam() {
					con = $(this).closest('article');

					con.find('div.dt-stats > div:not(:first-child)').remove();
					con.find('label').remove();
					con.find('> div:not(.dt-stats) > div:not(:first-child)').remove();

					con.css({display:'none'});
				}
				function displayTeam(team) {
					var stats = calcTeamStats(team);

					$('.dream-team h2').after($(document.createElement('span')).text('x').addClass('clear-selection'));

					$('.dream-team div.dt-stats .heading')
									.after($(document.createElement('div')).addClass('player heading')
									.append($(document.createElement('span')).text(formatNumber(stats.val)))
									.append($(document.createElement('span')).text(formatNumber(stats.points)))
									.append($(document.createElement('span')).text(formatNumber(stats.cost))));

					$.each(team, function(pos, players) {
						$('.dream-team div.'+pos.slice(0,1))
										.prepend($(document.createElement('label')).text(pos.slice(0,1).toUpperCase()+pos.slice(1)));
						players.forEach(function(pl) {
							$('.dream-team div.'+pos.slice(0,1)+' .heading').after(playerToDom(pl, 'player'));
						});
					});

					$('.dream-team').css({display:'block'});
				}
				function buildDreamTeam() {
					var maxCost = round(parseFloat($(this).siblings('input').val()), 2),
						dreamTeam = {
							goalkeepers:[],
							defenders:[],
							midfielders:[],
							forwards:[]
						},
						valueTeam = {
							goalkeepers:[],
							defenders:[],
							midfielders:[],
							forwards:[]
						};

					if(isNaN(parseFloat(maxCost))) {
						alert('Please enter a valid team value to calculate your dream team with.');
						return;
					}

					//Iterate over each position and grab the best performing players
					$.each(players, function(pos, playersArr) {
						playersArr.forEach(function(player) {
							addDTPlayer(dreamTeam, pos, player, 'points');
						});
					});
					$.each(players, function(pos, playersArr) {
						playersArr.forEach(function(player) {
							addDTPlayer(valueTeam, pos, player, 'val');
						});
					});

					dTStats = calcTeamStats(dreamTeam);
					vTStats = calcTeamStats(valueTeam);

					if(maxCost < vTStats.cost) {
						alert("Please raise your specified team cost.\n"
								+ "A decent team cannot be made for that cost.\n"
								+ "Minimum team cost should be "+vTStats.cost);
						return;
					}

					//Now begin upgrading players until the dream team cannot be upgraded without breaking team value
					//Find the player that is closest in price but higher in points than a current dt player
					var compPlayers = pairComparablePlayers(valueTeam);
					
					//Find the pair that has a comparable player with the highest value disparity from current player
					//and wont put the team over the limit
					var pair = true,
						compPlayers;

					while('undefined' !== typeof pair) {
						vTStats = calcTeamStats(valueTeam);
						compPlayers = pairComparablePlayers(valueTeam);
						pair = findBestPlayerPair(compPlayers, vTStats.cost, maxCost);
						if('undefined' !== typeof pair) {
							replacePlayer(valueTeam, pair);
						}
					}
					console.log(valueTeam);

					displayTeam(valueTeam);
				}

				//Player search
				$('body').on('keyup', '.suggestions > div > input', keyUpOnInput);
				//Select replacement player
				$('body').on('click', 'div.player', selectReplacement);
				//Clear replacement player
				$('body').on('click', '.clear-selection', clearSelectedReplacement);
				//Build dream team
				$('body').on('click', '#build-dream-team', buildDreamTeam);
				//Hide dream team
				$('body').on('click', '.dream-team .clear-selection', clearTeam);
			}
		});
	}				

	var players = getWeeksScores($('#game-week'));

	//Select a week
	$('body').on('change', '#game-week', function() {
		$('body').off('keyup, click');
		getWeeksScores($(this));
	});
});