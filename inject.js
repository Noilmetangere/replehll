const CURRENT_VERSION = "v0.3.4";
const RELEASES_URL = "https://api.github.com/repos/oghb/haxball-client/releases";
const EXTRA_GAMEMIN_URL_1 = "https://rawcdn.githack.com/oghb/haxball-client/5f7553fc655c7b90504eead44d9f593f24e3e7bd/game-min_custom.js?min=1";
const EXTRA_GAMEMIN_URL_2 = "https://rawcdn.githack.com/ThaiboyGoon/Haxball-Aimbot/15d9832fba63bf2612d270b4c04cdce15a8adfad/aim-avatar.js";

function injectGameMin(src) {
  const gameframe = document.documentElement.getElementsByClassName("gameframe")[0];
  let script = gameframe.contentWindow.document.createElement("script");
  script.src = src;
  script.type = "text/javascript";
  gameframe.contentWindow.document.getElementsByTagName("head")[0].appendChild(script);
}

function getOs() {
  if (navigator.userAgent.indexOf("Windows") !== -1) {
    return "win";
  } else if (navigator.userAgent.indexOf("Macintosh") !== -1) {
    return "macOS";
  } else {
    return "linux";
  }
}

async function checkLatestRelease() {
  const res = await fetch(RELEASES_URL, {
    method: "GET",
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  });

  const data = await res.json();
  const urls = data[0].assets
    .filter((el) => el.name.indexOf(getOs()) !== -1)
    .map((el) => el.browser_download_url);

  const latest = {
    version: data[0].tag_name,
    url: {
      standard: urls.find((el) => el.indexOf("Lite") === -1),
      lite: urls.find((el) => el.indexOf("Lite") !== -1),
    },
    notes: data[0].body,
    date: data[0].published_at.substr(0, 10),
  };

  return latest;
}

async function autoUpdater() {
  const latest = await checkLatestRelease();

  if (latest.version !== CURRENT_VERSION) {
    const choice = confirm(
      "New version available!\n\nYou have → " +
      CURRENT_VERSION +
      "\n🔥Latest → " +
      latest.version +
      "\n\nClick OK to check it out!"
    );
    if (choice) showUpdaterView(latest);
  }
}

function showUpdaterView(latest) {
  const gameframe = document.getElementsByClassName("gameframe")[0];
  gameframe.contentWindow.document.body.innerHTML = "";

  let updaterDiv = document.createElement("div");
  updaterDiv.className = "autoupdater-view";
  updaterDiv.setAttribute("class", "autoupdater-view");

  updaterDiv.style = `position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;`;

  updaterDiv.innerHTML = `<div class="dialog">

      <h1>New client version</h1>
      <h1 style="font-size: 15px">Changelog ${latest.version} (${
    latest.date
  })</h1>

      ${latest.notes.replaceAll("\n", "<br><br>")}

      <br><br><br>

      <div align="center">

        <p style="font-size: 18px; font-weight: bold">Choose which version to download</p>
        <br>
        <p style="font-size: 12px">❗️Don't close the client until the download has finished❗️</p>
        <br>

        <div class="dl-buttons">

          <button id="btn_std-dl" style="width: 200px" onclick="window.location.replace('${
            latest.url.standard
          }'); alert('The client is now being downloaded in your Downloads folder')">⬇💾 Standard</button>
          <button id="btn_light-dl" style="width: 200px" onclick="window.location.replace('${
            latest.url.lite
          }'); alert('The client is now being downloaded in your Downloads folder')">⬇💾 Lite</button>

        </div>

      </div>
  </div>`;

  gameframe.contentWindow.document.body.appendChild(updaterDiv);
}

// removes ads
if (document.getElementsByClassName("rightbar").length != 0) {
  document.getElementsByClassName("rightbar")[0].innerHTML = "";
}

// ... (나머지 코드)

// borrowed from Haxball-Room-Extension 'content.js'
// wait until the game in iFrame loads, then continue
function waitForElement(selector) {
  return new Promise(function (resolve, reject) {
    var element = document
      .getElementsByClassName("gameframe")[0]
      .contentWindow.document.querySelector(selector);

    if (element) {
      resolve(element);
      return;
    }

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        var nodes = Array.from(mutation.addedNodes);
        for (var node of nodes) {
          if (node.matches && node.matches(selector)) {
            resolve(node);
            return;
          }
        }
      });
    });

    observer.observe(
      document.getElementsByClassName("gameframe")[0].contentWindow.document,
      { childList: true, subtree: true }
    );
  });
}

// obeserver to detect changes to views
// and add custom buttons/shortcuts in chat
viewObserver = new MutationObserver(function (mutations) {
  candidates = mutations
    .flatMap((x) => Array.from(x.addedNodes))
    .filter((x) => x.className);
  if (candidates.length == 1) {
   
