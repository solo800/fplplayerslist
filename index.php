<?php
require('vendor/autoload.php');

$handle = opendir('weeklyscores');

$game_weeks = [];

while(($file_name = readdir($handle)) !== FALSE) {
  if(strpos($file_name, '.csv') !== FALSE) array_push($game_weeks, $file_name);
}
?>
<html>
  <head>
    <meta charset="utf-8">
    <title>Players List - Fantasy Premier League</title>
    <script src='jquery-1.11.3.min.js'></script>
    <script src='jquery.csv-0.71.min.js'></script>
    <script src='playersList.js'></script>
    <style>
      @font-face {
        font-family: 'chelsea';
        src: url('fonts/chelsea-webfont.eot');
        src: url('fonts/chelsea-webfont.eot?#iefix') format('embedded-opentype'),
             url('fonts/chelsea-webfont.woff2') format('woff2'),
             url('fonts/chelsea-webfont.woff') format('woff'),
             url('fonts/chelsea-webfont.ttf') format('truetype'),
             url('fonts/chelsea-webfont.svg#chelsearegular') format('svg');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'roboto';
        src: url('fonts/roboto-regular-webfont.eot');
        src: url('fonts/roboto-regular-webfont.eot?#iefix') format('embedded-opentype'),
             url('fonts/roboto-regular-webfont.woff2') format('woff2'),
             url('fonts/roboto-regular-webfont.woff') format('woff'),
             url('fonts/roboto-regular-webfont.ttf') format('truetype'),
             url('fonts/roboto-regular-webfont.svg#robotoregular') format('svg');
        font-weight: normal;
        font-style: normal;
      }
      html {
        height: 100%;
      }
      body {
        height: 100%;
      }
      * {
        box-sizing: border-box;
        font-family: 'roboto', 'sans-serif', 'serif';
      }
      .prem-players {
        display:none;
      }
      h1 {
        width: 100%;
        text-align: center;
        margin: 0;
        font-family: 'chelsea', 'sans-serif', 'serif';
        font-size: 3em;
      }
      .inputs {
        width: 30%;
        margin: 1.5% auto;
      }
      .inputs > * {
        float: left;
        text-align: center;
      }
      .inputs label {
        width: 50%;
      }
      .inputs > :not(label) {
        width: 40%;
        margin: 0 5%;
      }
      #build_dream_team {
        color: blue;
        text-decoration: underline;
        cursor: pointer;
      }
      .suggestions {
        height: 100%;
        width: 100%;
        margin: 0 auto;
        max-width: 1200px;
        min-width: 800px;
      }
      .suggestions > div {
        width: 24.5%;
        margin: 0 .25%;
        float: left;
      }
      .suggestions > div > * {
        float: left;
      }
      .suggestions > div > div {
        width: 100%;
        margin: 0 .1%;
      }
      .suggestions > div > div.heading > * {
        border-top: 1px solid #CAC6FF;
      }
      .suggestions > div > label, .suggestions > div > input {
        width: 80%;
        margin: .5% 10%;
        text-align: center;
      }
      .suggestions > div > div > * {
        border-width: 0;
        border-color: transparent;
        border-bottom: 1px solid #CAC6FF;
        border-right: 1px solid #CAC6FF;
      }
      .suggestions > div > div > *:first-child {
        border-left: 1px solid #CAC6FF;
      }
      .suggestions > div:last-child > div > *:last-child {
        border-right: 1px solid #CAC6FF;
      }
      div.replacement {
        position: relative;
        box-shadow: 0 0 0 1px transparent;
        margin: 0;
        transition: .3s;
      }
      div.replacement.show {
        border: 1px solid darkblue;
        margin-top: 1%;
      }
      div.replacement h2 {
        text-align: center;
        font-size: 1em;
        margin: 0;
      }
      div.replacement span:nth-child(2) {
        border: 0;
        width: 3%;
        position: absolute;
        top: 0;
        left: 1%;
        color: red;
        transform: scale(1);
        transition: .3s;
      }
      div.replacement span:nth-child(2):hover {
        cursor: pointer;
        transform: scale(1.5);
      }
      .suggestions > div > div span {
        width: 14%;
        float: left;
        font-size: .9em;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .suggestions > div > div span.long {
        width: 29%;
      }
      div.heading span {
        font-weight: bold;
      }
      div.player > * {
        transition: .3s;
        background-color: transparent;
      }
      div.player:hover > * {
        background-color: #CAC6FF;
        cursor: pointer;
      }
      div.player.player-suggestion > span {
        border-color: red;
      }
      div.player.player-suggestion > span:last-child {
        border-color: red;
      }
      .suggestions > div > h2 {
        font-size: 1em;
        margin: 0;
        width: 100%;
        text-align: center;
        border: 1px solid red;
        border-top: 0;
      }
      .game_week_file_names {
        display: none;
      }
      .clear-fix:before, .clear-fix:after {
        content: "";
        display: table;
      }
      .clear-fix:after {
        clear: both;
      }
      .clear-fix {
        zoom: 1;
        /* IE6&7 */
      }
    </style>
  </head>
  <body>
    <h1>FPL Players List</h1>
    <div class='inputs clear-fix'>
      <label>Game Week</label>
      <label id='build_dream_team'>Build Dream Team</label>
      <select id='game_week'>
        <?php
        $game_weeks = array_reverse($game_weeks);
        foreach($game_weeks as $week) {
          if(strpos($week, '00') !== FALSE) {
            $disp_week = 'Last Season';
          }
          else {
            $disp_week = substr_replace(str_replace('.csv', '', $week), ' ', strpos($week, 'Week') + 4, 0);
          }

          echo "<option value='$week'>$disp_week</option>";
        }
        ?>
      </select>
      <input type='text' placeholder='Team Value'/>
    </div>
    <article class='suggestions clear-fix'>
      <div class='g clear-fix'>
        <label>Goalkeepers</label>
        <input type='text' id='goalkeepers'/>
        <div class='heading'>
          <span class='long'>Name</span>
          <span class='long'>Team</span>
          <span>Pts</span>
          <span>&#163;</span>
          <span>Val</span>
        </div>
        <div class='replacement'></div>
      </div>
      <div class='d clear-fix'>
        <label>Defenders</label>
        <input type='text' id='defenders'/>
        <div class='heading'>
          <span class='long'>Name</span>
          <span class='long'>Team</span>
          <span>Pts</span>
          <span>&#163;</span>
          <span>Val</span>
        </div>
        <div class='replacement'></div>
      </div>
      <div class='m clear-fix'>
        <label>Midfielders</label>
        <input type='text' id='midfielders'/>
        <div class='heading'>
          <span class='long'>Name</span>
          <span class='long'>Team</span>
          <span>Pts</span>
          <span>&#163;</span>
          <span>Val</span>
        </div>
        <div class='replacement'></div>
      </div>
      <div class='f clear-fix'>
        <label>Forwards</label>
        <input type='text' id='forwards'/>
        <div class='heading'>
          <span class='long'>Name</span>
          <span class='long'>Team</span>
          <span>Pts</span>
          <span>&#163;</span>
          <span>Val</span>
        </div>
        <div class='replacement'></div>
      </div>
    </article>
  </body>
</html>