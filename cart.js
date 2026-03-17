const Cart = (() => {

    // Fallback in-memory store if localStorage is unavailable
    let _memStore = null;

    function storageAvailable() {
      try { localStorage.setItem("__test__", "1"); localStorage.removeItem("__test__"); return true; }
      catch { return false; }
    }

    function getItems() {
      try {
        if (storageAvailable()) {
          return JSON.parse(localStorage.getItem("pt_cart") || "[]");
        } else {
          return _memStore ? JSON.parse(_memStore) : [];
        }
      } catch { return []; }
    }
  
    function saveItems(items) {
      const json = JSON.stringify(items);
      try {
        if (storageAvailable()) {
          localStorage.setItem("pt_cart", json);
        } else {
          _memStore = json;
        }
      } catch(e) { console.warn("Cart: could not save to localStorage", e); }
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
  
    // Ravintolan osoite — vaihda tämä oikeaksi osoitteeksi
    const RESTAURANT_ADDRESS = "Alikeravantie 10, Kerava";

    function deliveryTimeFromKm(km) {
      if (km <= 3)  return 5;
      if (km <= 10) return 10;
      if (km <= 20) return 20;
      return null; // yli 20 km, ei toimiteta
    }

    async function checkout() {
      const name    = document.getElementById("ct_name").value.trim();
      const address = document.getElementById("ct_address").value.trim();
      const phone   = document.getElementById("ct_phone").value.trim();
      const btn     = document.getElementById("ct_order_btn");
      const infoEl  = document.getElementById("ct_distance_info");

      if (getItems().length === 0) {
        showMsg("Ostoskori on tyhjä!", "error"); return;
      }
      if (!name || !address || !phone) {
        showMsg("Täytä kaikki kentät!", "error"); return;
      }

      btn.disabled = true;
      btn.textContent = "Lasketaan...";
      infoEl.style.color = "#888";
      infoEl.textContent = "";

      try {
        const custRes = await fetch(
          "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
          encodeURIComponent(address),
          { headers: { "Accept-Language": "fi" } }
        );
        const custData = await custRes.json();
        if (!custData.length) throw new Error("Osoitetta ei löydy. Tarkista osoite.");

        const restRes = await fetch(
          "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
          encodeURIComponent(RESTAURANT_ADDRESS),
          { headers: { "Accept-Language": "fi" } }
        );
        const restData = await restRes.json();
        if (!restData.length) throw new Error("Ravintolan osoitetta ei löydy.");

        const cLat = parseFloat(custData[0].lat), cLon = parseFloat(custData[0].lon);
        const rLat = parseFloat(restData[0].lat), rLon = parseFloat(restData[0].lon);

        const routeRes = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${rLon},${rLat};${cLon},${cLat}?overview=false`
        );
        const routeData = await routeRes.json();
        if (routeData.code !== "Ok") throw new Error("Reittilaskenta epäonnistui.");

        const km = routeData.routes[0].distance / 1000;
        const delivTime = deliveryTimeFromKm(km);

        if (delivTime === null) {
          infoEl.style.color = "#cc2200";
          infoEl.textContent = `${km.toFixed(1)} km — liian kaukana (max 20 km)`;
          btn.disabled = false;
          btn.textContent = "Vahvista tilaus";
          return;
        }

        const prepTime  = calculatePrepTime();
        const totalTime = prepTime + delivTime;

        infoEl.style.color = "#1a7a3c";
        infoEl.textContent = `${km.toFixed(1)} km — toimitus ~${delivTime} min`;

        clearCart();
        document.getElementById("ct_name").value = "";
        document.getElementById("ct_address").value = "";
        document.getElementById("ct_phone").value = "";
        infoEl.style.color = "#888";
        infoEl.textContent = "";
        showMsg(
          `Kiitos, ${name}! Valmistus ${prepTime} min + toimitus ${delivTime} min = yhteensä ${totalTime} min.`,
          "success"
        );

      } catch(e) {
        infoEl.style.color = "#cc2200";
        infoEl.textContent = e.message || "Virhe etäisyyden laskennassa.";
      }

      btn.disabled = false;
      btn.textContent = "Vahvista tilaus";
    }
  
    function showMsg(text, type) {
      const el = document.getElementById("ct_msg");
      if (!el) return;
      el.textContent = text;
      el.className = "ct-msg " + type;
      el.style.display = "block";
      ;
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
          body { margin-right: 280px !important; }

          #ct_panel {
            position: fixed;
            top: 0; right: 0;
            width: 280px;
            height: 100vh;
            background: #ffffff;
            border-left: 1px solid #dddddd;
            display: flex;
            flex-direction: column;
            z-index: 2000;
            font-family: 'DM Sans', sans-serif;
          }

          #ct_header {
            background: #cc2200;
            color: #fff;
            padding: 12px 14px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
          }

          #ct_badge {
            background: #fff;
            color: #cc2200;
            border-radius: 50%;
            width: 18px; height: 18px;
            font-size: 10px;
            font-weight: 700;
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
            padding: 40px 0;
            font-size: 13px;
          }

          .ct-item {
            background: #fafafa;
            padding: 9px 10px;
            margin-bottom: 4px;
            border: 1px solid #eeeeee;
          }

          .ct-item-name {
            font-size: 13px;
            font-weight: 700;
            color: #111;
            margin-bottom: 2px;
          }

          .ct-item-details {
            font-size: 11px;
            color: #888;
            margin-bottom: 5px;
            line-height: 1.4;
          }

          .ct-item-row {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .ct-qty-btn {
            background: #f0f0f0 !important;
            color: #111 !important;
            border: 1px solid #ddd !important;
            width: 20px; height: 20px;
            font-size: 13px;
            cursor: pointer;
            padding: 0 !important;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
          }

          .ct-qty-btn:hover { background: #cc2200 !important; color: #fff !important; border-color: #cc2200 !important; }

          .ct-qty {
            min-width: 18px;
            text-align: center;
            font-weight: 700;
            font-size: 13px;
          }

          .ct-item-price {
            margin-left: auto;
            font-weight: 700;
            color: #cc2200;
            font-size: 13px;
          }

          .ct-remove {
            background: transparent !important;
            border: none !important;
            cursor: pointer;
            font-size: 13px;
            padding: 0 !important;
            color: #ccc;
            margin-left: 3px;
          }

          .ct-remove:hover { color: #cc2200 !important; }

          #ct_footer {
            border-top: 1px solid #dddddd;
            padding: 12px;
            flex-shrink: 0;
            background: #fff;
          }

          #ct_total_row {
            display: flex;
            justify-content: space-between;
            font-weight: 700;
            font-size: 14px;
            color: #111;
            margin-bottom: 10px;
          }

          #ct_footer input {
            width: 100%;
            box-sizing: border-box;
            padding: 7px 9px;
            margin-bottom: 6px;
            border: 1px solid #dddddd;
            background: #fafafa;
            font-family: 'DM Sans', sans-serif;
            font-size: 13px;
            outline: none;
          }

          #ct_footer input:focus { border-color: #cc2200; background: #fff; }
          #ct_footer input::placeholder { color: #bbb; }

          #ct_order_btn {
            width: 100%;
            background: #cc2200 !important;
            color: #fff !important;
            border: none !important;
            padding: 10px !important;
            font-family: 'DM Sans', sans-serif !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            letter-spacing: 1px !important;
            text-transform: uppercase !important;
            cursor: pointer;
            margin-top: 4px;
          }

          #ct_order_btn:hover { opacity: 0.85 !important; }

          .ct-msg {
            display: none;
            font-size: 12px;
            padding: 6px 8px;
            margin-top: 6px;
            text-align: center;
          }

          .ct-msg.error   { color: #cc2200; }
          .ct-msg.success { color: #1a7a3c; }

          @media (max-width: 600px) {
            body { margin-right: 0 !important; }
            #ct_panel { width: 100%; height: auto; top: auto; bottom: 0; border-left: none; border-top: 1px solid #ddd; max-height: 50vh; }
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
            <input type="text" id="ct_address" placeholder="Toimitusosoite" />
            <input type="text" id="ct_phone" placeholder="Puhelinnumero" />
            <div id="ct_distance_info" style="padding:6px 9px;font-size:12px;color:#888;margin-bottom:6px;"></div>
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

  // Sync cart across tabs/pages when localStorage changes
  window.addEventListener("storage", (e) => {
    if (e.key === "pt_cart") {
      renderCart();
      updateBadge();
    }
  });