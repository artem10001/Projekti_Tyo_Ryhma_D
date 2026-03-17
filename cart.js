const Cart = (() => {

    function getItems() {
      try { return JSON.parse(localStorage.getItem("pt_cart") || "[]"); }
      catch { return []; }
    }
  
    function saveItems(items) {
      localStorage.setItem("pt_cart", JSON.stringify(items));
      renderCart();
      updateBadge();
    }
  
    function addItem(name, price, details) {
      const items = getItems();
      const key = name + "|" + (details || "");
      const existing = items.find(i => i.key === key);
      if (existing) {
        existing.qty++;
      } else {
        items.push({ key, name, price: parseFloat(price), details: details || "", qty: 1 });
      }
      saveItems(items);
      flashCartPanel();
    }
  
    function changeQty(key, delta) {
      let items = getItems();
      const item = items.find(i => i.key === key);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) items = items.filter(i => i.key !== key);
      saveItems(items);
    }
  
    function removeItem(key) {
      saveItems(getItems().filter(i => i.key !== key));
    }
  
    function clearCart() {
      saveItems([]);
    }
  
    function totalPrice() {
      return getItems().reduce((s, i) => s + i.price * i.qty, 0);
    }
  
    function totalCount() {
      return getItems().reduce((s, i) => s + i.qty, 0);
    }

    function calculatePrepTime() {
        const items = getItems();
        let total = 0;
      
        items.forEach(item => {
          let time = 0;
          const name = item.name.toLowerCase();
          const details = (item.details || "").toLowerCase();
      
          // Onko fantasia-pizza?
          const isFantasia = name.includes("fantasia");
      
          // Onko gluteeniton?
          const isGlutenFree = details.includes("gluteeniton");
      
          // Lasketaan lisätäytteet (oletus: pilkulla eroteltu lista)
          let extraCount = 0;
          if (details) {
            extraCount = details.split(",").length;
          }
      
          if (isFantasia) {
            time = 7;
          } else {
            time = 10;
          }
      
          if (isGlutenFree) time += 3;
      
          time += extraCount * 1;
      
          total += time * item.qty;
        });
      
        return total;
      }
  
    function renderCart() {
      const list = document.getElementById("ct_list");
      const totalEl = document.getElementById("ct_total");
      if (!list) return;
  
      const items = getItems();
      if (items.length === 0) {
        list.innerHTML = '<li class="ct-empty">Ostoskori on tyhjä</li>';
      } else {
        list.innerHTML = items.map(item => `
          <li class="ct-item">
            <div class="ct-item-name">${item.name}</div>
            ${item.details ? `<div class="ct-item-details">${item.details}</div>` : ""}
            <div class="ct-item-row">
              <button class="ct-qty-btn" onclick="Cart.changeQty('${escKey(item.key)}', -1)">−</button>
              <span class="ct-qty">${item.qty}</span>
              <button class="ct-qty-btn" onclick="Cart.changeQty('${escKey(item.key)}', 1)">+</button>
              <span class="ct-item-price">${(item.price * item.qty).toFixed(2)} €</span>
              <button class="ct-remove" onclick="Cart.removeItem('${escKey(item.key)}')">🗑</button>
            </div>
          </li>`).join("");
      }
  
      if (totalEl) totalEl.textContent = totalPrice().toFixed(2);
    }
  
    function updateBadge() {
      const badge = document.getElementById("ct_badge");
      if (!badge) return;
      const n = totalCount();
      badge.textContent = n;
      badge.style.display = n > 0 ? "flex" : "none";
    }
  
    function flashCartPanel() {
      const panel = document.getElementById("ct_panel");
      if (!panel) return;
      panel.classList.add("ct-flash");
      setTimeout(() => panel.classList.remove("ct-flash"), 600);
    }
    
    function escKey(key) {
      return key.replace(/'/g, "\\'");
    }
  
    function checkout() {
      const name    = document.getElementById("ct_name").value.trim();
      const address = document.getElementById("ct_address").value.trim();
      const phone   = document.getElementById("ct_phone").value.trim();
  
      if (getItems().length === 0) {
        showMsg("Ostoskori on tyhjä!", "error"); return;
      }
      if (!name || !address || !phone) {
        showMsg("Täytä kaikki kentät!", "error"); return;
      }
  
      const prepTime = calculatePrepTime();

      showMsg(
        `Kiitos tilauksesta ${name}! 
        Arvioitu valmistusaika: ${prepTime} min 
        Toimitetaan: ${address}`,
        "success"
      );
    }
  
    function showMsg(text, type) {
      const el = document.getElementById("ct_msg");
      if (!el) return;
      el.textContent = text;
      el.className = "ct-msg " + type;
      el.style.display = "block";
      if (type === "success") setTimeout(() => { el.style.display = "none"; }, 5000);
    }
  
    function init() {
      injectHTML();
      renderCart();
      updateBadge();
    }
  
    function injectHTML() {
      if (!document.getElementById("ct_style")) {
        const style = document.createElement("style");
        style.id = "ct_style";
        style.textContent = `
          body { margin-right: 320px; }
  
          #ct_panel {
            position: fixed;
            top: 0; right: 0;
            width: 300px;
            height: 100vh;
            background: #fff;
            border-left: 3px solid #b22222;
            box-shadow: -4px 0 18px rgba(0,0,0,0.13);
            display: flex;
            flex-direction: column;
            z-index: 2000;
            font-family: Arial, sans-serif;
            transition: box-shadow 0.3s;
          }
  
          #ct_panel.ct-flash {
            box-shadow: -4px 0 28px rgba(178,34,34,0.45);
          }
  
          #ct_header {
            background: #b22222;
            color: white;
            padding: 14px 16px;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
          }
  
          #ct_badge {
            background: #fff;
            color: #b22222;
            border-radius: 50%;
            width: 22px; height: 22px;
            font-size: 12px;
            font-weight: bold;
            display: none;
            align-items: center;
            justify-content: center;
            margin-left: auto;
          }
  
          #ct_list {
            list-style: none;
            margin: 0; padding: 8px;
            flex: 1;
            overflow-y: auto;
          }
  
          .ct-empty {
            text-align: center;
            color: #aaa;
            padding: 30px 0;
            font-size: 14px;
          }
  
          .ct-item {
            background: #fdf5f0;
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 8px;
            border: 1px solid #f0ddd5;
          }
  
          .ct-item-name {
            font-weight: bold;
            font-size: 14px;
            color: #333;
            margin-bottom: 2px;
          }
  
          .ct-item-details {
            font-size: 11px;
            color: #888;
            margin-bottom: 6px;
            line-height: 1.4;
          }
  
          .ct-item-row {
            display: flex;
            align-items: center;
            gap: 5px;
          }
  
          .ct-qty-btn {
            background: #b22222 !important;
            color: white !important;
            border: none !important;
            width: 24px; height: 24px;
            border-radius: 4px !important;
            font-size: 14px;
            cursor: pointer;
            padding: 0 !important;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
          }
  
          .ct-qty {
            min-width: 20px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
          }
  
          .ct-item-price {
            margin-left: auto;
            font-weight: bold;
            color: #b22222;
            font-size: 13px;
          }
  
          .ct-remove {
            background: transparent !important;
            border: none !important;
            cursor: pointer;
            font-size: 15px;
            padding: 0 !important;
            color: #aaa;
            margin-left: 4px;
          }
  
          .ct-remove:hover { color: #b22222 !important; background: transparent !important; }
  
          #ct_footer {
            border-top: 2px solid #f0ddd5;
            padding: 12px;
            flex-shrink: 0;
            background: #fff;
          }
  
          #ct_total_row {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 16px;
            color: #b22222;
            margin-bottom: 10px;
          }
  
          #ct_footer input {
            width: 100%;
            box-sizing: border-box;
            padding: 7px 10px;
            margin-bottom: 7px;
            border: 1.5px solid #ddd;
            border-radius: 5px;
            font-size: 13px;
            outline: none;
          }
  
          #ct_footer input:focus { border-color: #b22222; }
  
          #ct_order_btn {
            width: 100%;
            background: #2b9900 !important;
            color: white !important;
            border: none !important;
            padding: 10px !important;
            border-radius: 5px !important;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            letter-spacing: 0.5px;
            margin-top: 2px;
          }
  
          #ct_order_btn:hover { background: #207e00 !important; }
  
          .ct-msg {
            display: none;
            font-size: 12px;
            padding: 7px 10px;
            border-radius: 4px;
            margin-top: 8px;
            text-align: center;
          }
  
          .ct-msg.error { background: #fdecea; color: darkred; border: 1px solid #c0392b; }
          .ct-msg.success { background: #eafaf1; color: #1e8449; border: 1px solid #a9dfbf; }
  
          @media (max-width: 700px) {
            body { margin-right: 0; }
            #ct_panel { width: 100%; height: auto; top: auto; bottom: 0; border-left: none; border-top: 3px solid #b22222; max-height: 50vh; }
          }
        `;
        document.head.appendChild(style);
      }
  
      if (!document.getElementById("ct_panel")) {
        const panel = document.createElement("div");
        panel.id = "ct_panel";
        panel.innerHTML = `
          <div id="ct_header">
            Ostoskori
            <span id="ct_badge">0</span>
          </div>
          <ul id="ct_list"></ul>
          <div id="ct_footer">
            <div id="ct_total_row">
              <span>Yhteensä:</span>
              <span><span id="ct_total">0.00</span> €</span>
            </div>
            <input type="text" id="ct_name" placeholder="Nimi" />
            <input type="text" id="ct_address" placeholder="Osoite" />
            <input type="text" id="ct_phone" placeholder="Puhelinnumero" />
            <button id="ct_order_btn" onclick="Cart.checkout()">Vahvista tilaus</button>
            <div id="ct_msg" class="ct-msg"></div>
          </div>
        `;
        document.body.appendChild(panel);
      }
    }
  
    return { init, addItem, changeQty, removeItem, clearCart, checkout };
  
  })();
  
  document.addEventListener("DOMContentLoaded", () => Cart.init());