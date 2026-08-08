const content = document.getElementById("content");
const countLabel = document.getElementById("countLabel");
const userLabel = document.getElementById("userLabel");
const logoutBtn = document.getElementById("logoutBtn");

// Redirect to sign-in if there's no token.
if (!getToken()) {
  window.location.href = "index.html";
}

logoutBtn.addEventListener("click", () => {
  clearToken();
  window.location.href = "index.html";
});

function renderEmpty() {
  content.innerHTML = `
    <div class="empty-state">
      <div class="stamp">Ledger empty</div>
      <p>No assets on record yet.</p>
    </div>
  `;
}

function renderError(message) {
  content.innerHTML = `
    <div class="empty-state">
      <div class="stamp" style="border-color:var(--err); color:var(--err);">Could not load</div>
      <p>${message}</p>
    </div>
  `;
}

function isCheckedOut(asset) {
  const status = (asset.status || "").toString().toLowerCase();
  return status.includes("out") || asset.checkedOut === true || Boolean(asset.assignedTo);
}

function renderAssets(assets) {
  if (!assets || assets.length === 0) {
    renderEmpty();
    countLabel.textContent = "0 records";
    return;
  }

  countLabel.textContent = `${assets.length} record${assets.length === 1 ? "" : "s"}`;

  const grid = document.createElement("div");
  grid.className = "asset-grid";

  assets.forEach((asset) => {
    const id = asset.id ?? asset._id ?? asset.assetId;
    const name = asset.name || asset.title || `Asset #${id}`;
    const out = isCheckedOut(asset);
    const status = out ? "checked out" : "available";

    const card = document.createElement("div");
    card.className = "asset-card";
    card.dataset.status = status;

    card.innerHTML = `
      <div class="asset-id">ID · ${id}</div>
      <div class="asset-name">${name}</div>
      <div class="asset-meta">${asset.category || asset.type || "Uncategorized"}${
        asset.assignedTo ? ` · with ${asset.assignedTo}` : ""
      }</div>
      <button class="btn-action ${out ? "checkin" : "checkout"}" data-id="${id}" data-out="${out}">
        ${out ? "Check in" : "Check out"}
      </button>
    `;

    grid.appendChild(card);
  });

  content.innerHTML = "";
  content.appendChild(grid);

  grid.querySelectorAll(".btn-action").forEach((btn) => {
    btn.addEventListener("click", () => handleAction(btn));
  });
}

async function handleAction(btn) {
  const id = btn.dataset.id;
  const out = btn.dataset.out === "true";
  const endpoint = out ? ENDPOINTS.checkin(id) : ENDPOINTS.checkout(id);

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = out ? "Checking in…" : "Checking out…";

  try {
    await apiRequest(endpoint, { method: "POST", auth: true });
    await loadAssets();
  } catch (err) {
    btn.disabled = false;
    btn.textContent = originalText;
    alert(err.message);
  }
}

async function loadAssets() {
  try {
    const data = await apiRequest(ENDPOINTS.assets, { auth: true });
    // Handle either a bare array or a { assets: [...] } wrapper.
    const assets = Array.isArray(data) ? data : data.assets || data.data || [];
    renderAssets(assets);
  } catch (err) {
    renderError(err.message);
    countLabel.textContent = "—";
  }
}

loadAssets();