const facilityGroups = [
  {id:1,name:"자동차 관련 시설군",color:"#0877ff",uses:["자동차 관련 시설","주차장","주유소","차고","자동차매매장","운전학원"]},
  {id:2,name:"산업 등 시설군",color:"#ff8a19",uses:["운수시설","창고시설","공장","위험물 저장 및 처리시설","자원순환 관련 시설","묘지 관련 시설","장례시설"]},
  {id:3,name:"전기통신시설군",color:"#6255e8",uses:["방송통신시설","발전시설"]},
  {id:4,name:"문화 및 집회시설군",color:"#ba43cf",uses:["문화 및 집회시설","종교시설","위락시설","관광휴게시설"]},
  {id:5,name:"영업시설군",color:"#ff6b18",uses:["판매시설","운동시설","숙박시설","제2종 근린생활시설 중 다중생활시설"]},
  {id:6,name:"교육 및 복지시설군",color:"#19b9b0",uses:["의료시설","교육연구시설","노유자시설","수련시설","야영장 시설"]},
  {id:7,name:"근린생활시설군",color:"#e5bd16",uses:["제1종 근린생활시설","제2종 근린생활시설(다중생활시설 제외)"]},
  {id:8,name:"주거업무시설군",color:"#2584e8",uses:["단독주택","공동주택","업무시설","교정시설","국방·군사시설"]},
  {id:9,name:"그 밖의 시설군",color:"#64839f",uses:["동물 및 식물 관련 시설"]}
];

let beforeUse = null;
let afterUse = null;
window.activeMode = "before";

const list = document.getElementById("facilityList");
const search = document.getElementById("searchInput");

function renderList(query = "") {
  list.innerHTML = "";
  const q = query.trim().toLowerCase();

  facilityGroups.forEach(group => {
    const matches = group.uses.filter(use =>
      `${group.name} ${use}`.toLowerCase().includes(q)
    );
    if (!matches.length) return;

    const row = document.createElement("div");
    row.className = "facility-row";
    row.style.setProperty("--row-color", group.color);
    row.dataset.group = group.id;

    const name = document.createElement("div");
    name.className = "facility-name";
    const number = document.createElement("span");
    number.className = "facility-num";
    number.textContent = group.id;
    const groupName = document.createElement("b");
    groupName.textContent = group.name;
    name.append(number, groupName);

    const uses = document.createElement("div");
    uses.className = "subuses";

    matches.forEach(use => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "use-chip";
      chip.textContent = use;
      chip.title = `${group.name} · ${use}`;
      chip.addEventListener("click", () => selectUse(use, group));
      uses.appendChild(chip);
    });

    row.append(name, uses);
    list.appendChild(row);
  });

  updateSelectedChips();
  updateActiveModeDisplay();
}

function setActiveMode(mode) {
  window.activeMode = mode;
  updateActiveModeDisplay();

  const arrow = document.getElementById(mode === "before" ? "beforeArrow" : "afterArrow");
  arrow.classList.remove("is-active");
  void arrow.offsetWidth;
  arrow.classList.add("is-active");
  window.setTimeout(() => arrow.classList.remove("is-active"), 500);

  // Keep the arrow fixed; only bring the existing list into view.
  if (window.matchMedia("(max-width: 850px)").matches) {
    document.querySelector(".use-list-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function updateActiveModeDisplay() {
  document.querySelector(".before-panel").classList.toggle("mode-active", window.activeMode === "before");
  document.querySelector(".after-panel").classList.toggle("mode-active", window.activeMode === "after");

  const beforeHint = document.querySelector("#beforeArrow").nextElementSibling;
  const afterHint = document.querySelector("#afterArrow").nextElementSibling;
  beforeHint.textContent = window.activeMode === "before"
    ? "선택 중 · 중앙 목록에서 세부 용도를 클릭하세요"
    : "클릭 후 변경 전 용도를 선택하세요";
  afterHint.textContent = window.activeMode === "after"
    ? "선택 중 · 중앙 목록에서 세부 용도를 클릭하세요"
    : "클릭 후 변경 후 용도를 선택하세요";
}

function selectUse(use, group) {
  const mode = window.activeMode || "before";

  if (mode === "before") {
    beforeUse = { use, groupId: group.id, groupName: group.name };
    document.getElementById("beforeSelected").textContent = `${use} · ${group.id}번 시설군`;
  } else {
    afterUse = { use, groupId: group.id, groupName: group.name };
    document.getElementById("afterSelected").textContent = `${use} · ${group.id}번 시설군`;
  }

  list.querySelectorAll(".facility-row").forEach(row => {
    row.classList.remove("row-active-before", "row-active-after");
    if (Number(row.dataset.group) === group.id) {
      row.classList.add(mode === "before" ? "row-active-before" : "row-active-after");
    }
  });

  updateSelectedChips();
  updateResult();
}

function updateSelectedChips() {
  list.querySelectorAll(".use-chip").forEach(chip => {
    chip.classList.remove("selected-before", "selected-after");
    if (beforeUse && chip.textContent === beforeUse.use) chip.classList.add("selected-before");
    if (afterUse && chip.textContent === afterUse.use) chip.classList.add("selected-after");
  });
}

function updateResult() {
  const empty = document.getElementById("resultEmpty");
  const content = document.getElementById("resultContent");

  if (!beforeUse || !afterUse) {
    empty.hidden = false;
    content.hidden = true;
    return;
  }

  empty.hidden = true;
  content.hidden = false;

  const title = document.getElementById("resultTitle");
  const summary = document.getElementById("resultSummary");
  const reason = document.getElementById("resultReason");
  const meta = document.getElementById("resultMeta");
  const from = beforeUse.groupId;
  const to = afterUse.groupId;

  let heading, summaryText, reasonText;
  if (beforeUse.use === afterUse.use) {
    heading = "동일 용도 선택";
    summaryText = "변경 전·후 용도가 같습니다. 실제 변경 내용이 있는지 확인하세요.";
    reasonText = "동일한 세부 용도를 선택했습니다. 다른 용도로 변경하려는 경우 변경 후 용도를 다시 선택하세요.";
  } else if (from === to) {
    heading = "대장 기재내용 변경 검토";
    summaryText = "같은 시설군 내 용도변경입니다.";
    reasonText = "같은 시설군 내 변경은 원칙적으로 건축물대장 기재내용 변경 신청 여부를 검토합니다. 시행령 제14조의 절차 생략 예외 및 제외 용도를 반드시 대조해야 합니다.";
  } else if (to < from) {
    heading = "허가 대상 검토";
    summaryText = "상위 시설군으로 변경하는 경우입니다.";
    reasonText = "건축법 제19조에 따라 변경하려는 용도가 현재보다 상위 시설군(번호가 작은 시설군)에 해당하면 용도변경 허가 대상입니다.";
  } else {
    heading = "신고 대상 검토";
    summaryText = "하위 시설군으로 변경하는 경우입니다.";
    reasonText = "건축법 제19조에 따라 변경하려는 용도가 현재보다 하위 시설군(번호가 큰 시설군)에 해당하면 용도변경 신고 대상입니다.";
  }

  title.textContent = heading;
  summary.textContent = summaryText;
  reason.textContent = reasonText;
  meta.textContent = `변경 전: ${beforeUse.use} (${from}번) → 변경 후: ${afterUse.use} (${to}번)`;
}

document.getElementById("beforeArrow").addEventListener("click", () => setActiveMode("before"));
document.getElementById("afterArrow").addEventListener("click", () => setActiveMode("after"));
search.addEventListener("input", () => renderList(search.value));

renderList();
