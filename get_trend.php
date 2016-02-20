<?php
function buildFileName($weekNum) {
  return ('Week' . ($weekNum < 10 ? '0' . $weekNum : $weekNum) . '.csv');
}

function buildWeek($fileName) {
  $handle = fopen($fileName, 'r');

  $heading = 'player';
  $positions = ['goalkeepers', 'defenders', 'midfielders', 'forwards'];
  $players = [];
  $cur_pos = null;

  while(($row = fgetcsv($handle)) !== FALSE) {
    if(in_array($row[0], $positions)) {
      $cur_pos = $row[0];
      if(!array_key_exists($cur_pos, $players)) {
        $players[$cur_pos] = [];
      }
    }
    elseif($heading !== $row[0] && null !== $cur_pos) {
      array_push($players[$cur_pos], $row);
    }
  }

  return $players;
}

if(isset($_GET)) {
  $params = json_decode($_GET['data'], TRUE);
  $rootDir = 'weeklyscores/';

  $startWeek = $params['startWeek'];
  $curWeek = $startWeek;
  $numWeeks = $params['numWeeks'];
  $weighting = $params['weighting'];

  $players = [];

  while(0 < $numWeeks) {
    $found = FALSE;

    while(!$found) {
      if(file_exists($rootDir . buildFileName($curWeek))) {
        $found = TRUE;
        $players[$curWeek] = buildWeek($rootDir . buildFileName($curWeek));
        --$curWeek;
      }
      else {
        // If we've reached beyond the first week and we're still looking end the loop
        if($curWeek === 0) {
          $numWeeks = 0;
          $found = TRUE;
        }
        else --$curWeek;
      }
    }
    --$numWeeks;
  }

  $trends = [];

  foreach($players as $week => $positions) {
    echo "Week: $week\n";
    foreach($positions as $pos => $weeksPlayers) {
      echo "Position: $pos\n";
      if(!array_key_exists($pos, $trends)) {
        $trends[$pos] = [];

        foreach($weeksPlayers as $player) {
          $pr = str_replace('£', '', $player[3]);
          echo "Player:\nName: $player[0], Team: $player[1], Points: $player[2], Price: $pr\n";
          if(in_array($player[0], ['players', ''])) continue;
          echo "Adding\n";
          if(!array_key_exists($player[0], $trends[$pos])) {
            echo "Creating new $player[0]\n";
            $trends[$pos][$player[0]] = [$player];
          }
          elseif(array_key_exists($player[0], $trends[$pos])) {
            echo "Adding to $player[0]\n";
            array_push($trends[$pos][$player[0]], $player);
          }
        }
      }
    }
  }

  $players['trends'] = $trends;

  // echo json_encode($players);
}
else {
  echo "Error! No GET var set";
}
