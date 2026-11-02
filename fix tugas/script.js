// ---------- DATA DUMMY ----------
const hariIni = new Date();
hariIni.setHours(0, 0, 0, 0);

function hariLalu(n) {
  const d = new Date(hariIni);
  d.setDate(d.getDate() - n);
  return d;
}

let produk = [
  { id: 1,  nama: 'Nasi Goreng',      kategori: 'Makanan', harga: 10000, stok: 25 },
  { id: 2,  nama: 'Mie Ayam',         kategori: 'Makanan', harga: 8000,  stok: 20 },
  { id: 3,  nama: 'Nasi Uduk',        kategori: 'Makanan', harga: 7000,  stok: 30 },
  { id: 4,  nama: 'Es Teh Manis',     kategori: 'Minuman', harga: 3000,  stok: 60 },
  { id: 5,  nama: 'Jus Jeruk',        kategori: 'Minuman', harga: 6000,  stok: 24 },
  { id: 6,  nama: 'Air Mineral',      kategori: 'Minuman', harga: 4000,  stok: 80 },
  { id: 7,  nama: 'Keripik Singkong', kategori: 'Snack',   harga: 5000,  stok: 40 },
  { id: 8,  nama: 'Roti Coklat',      kategori: 'Snack',   harga: 4000,  stok: 35 },
  { id: 9,  nama: 'Pisang Goreng',    kategori: 'Snack',   harga: 2000,  stok: 50 },
  { id: 10, nama: 'Susu Kotak',       kategori: 'Minuman', harga: 5000,  stok: 45 }
];

const transaksi = [
  [6, 1, 12], [6, 4, 20], [6, 7, 8],  [5, 2, 10], [5, 5, 9],  [5, 9, 15], [4, 3, 14],
  [4, 6, 18], [4, 8, 7],  [3, 1, 11], [3, 10, 12], [3, 7, 10], [2, 2, 13], [2, 4, 22],
  [2, 9, 12], [1, 3, 9],  [1, 5, 8],  [1, 8, 11], [0, 1, 15], [0, 6, 16], [0, 10, 9]
].map(t => ({ tgl: hariLalu(t[0]), produkId: t[1], qty: t[2] }));

// ---------- STATE FILTER ----------
const state = {
  awal: hariLalu(6),
  akhir: hariIni,
  kategori: ['Makanan', 'Minuman', 'Snack']
};

// ---------- FUNGSI BANTU ----------
const rupiah = n => 'Rp' + n.toLocaleString('id-ID');
const cariProduk = id => produk.find(p => p.id === id);

function dataTerfilter() {
  return transaksi.filter(t => {
    const p = cariProduk(t.produkId);
    return p && t.tgl >= state.awal && t.tgl <= state.akhir && state.kategori.includes(p.kategori);
  });
}

// ---------- 1. FLATPICKR (Filter Rentang Tanggal) ----------
flatpickr('#fDate', {
  mode: 'range',
  dateFormat: 'd M Y',
  locale: 'id',
  defaultDate: [state.awal, state.akhir],
  maxDate: 'today',
  onChange(tgl) {
    if (tgl.length === 2) {
      [state.awal, state.akhir] = tgl;
      applyFilter();
    }
  }
});

// ---------- 2. TOM SELECT (Filter Kategori Multi-Select) ----------
const selectKat = document.getElementById('fKat');
['Makanan', 'Minuman', 'Snack'].forEach(kat => {
  const opt = document.createElement('option');
  opt.value = kat;
  opt.textContent = kat;
  opt.selected = true;
  selectKat.appendChild(opt);
});

// 1. Perbarui Tom Select agar membolehkan array kategori kosong ([] )
new TomSelect('#fKat', {
  plugins: ['remove_button'],
  placeholder: 'Pilih kategori...',
  persist: false,
  onChange(nilai) {
    // Jika dikosongkan, jadikan array kosong sungguhan agar data ikut kosong
    state.kategori = [].concat(nilai);
    applyFilter();
  }
});

// ---------- 3. CHART.JS (Grafik Batang & Donat Reaktif) ----------
const ctxBar = document.getElementById('cBar').getContext('2d');
const grafikBar = new Chart(ctxBar, {
  type: 'bar',
  data: {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    datasets: [{ label: 'Omzet (Rp)', data: [0,0,0,0,0,0,0], backgroundColor: '#357DE8', borderRadius: 4 }]
  },
  options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
});

const ctxDn = document.getElementById('cDn').getContext('2d');
const grafikDn = new Chart(ctxDn, {
  type: 'doughnut',
  data: {
    labels: ['Makanan', 'Minuman', 'Snack'],
    datasets: [{ data: [0,0,0], backgroundColor: ['#357DE8', '#82B536', '#BF63F3'], borderWidth: 2 }]
  },
  options: { responsive: true, maintainAspectRatio: false }
});

// ---------- 4. TABULATOR (Tabel Produk & SweetAlert2 Hapus) ----------
let tabelProduk = new Tabulator('#tProd', {
  data: produk,
  layout: 'fitColumns',
  pagination: true,
  paginationSize: 5,
  columns: [
    { title: 'Produk', field: 'nama', headerFilter: 'input' },
    { title: 'Kategori', field: 'kategori' },
    { title: 'Harga', field: 'harga', sorter: 'number', formatter: cell => rupiah(cell.getValue()) },
    { title: 'Stok', field: 'stok', sorter: 'number' },
    {
      title: 'Aksi',
      formatter: () => '<button class="icon-btn del" title="Hapus"><svg class="ic" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>',
      cellClick: (e, cell) => {
        const rowData = cell.getRow().getData();
        
        // SweetAlert2 Konfirmasi Hapus
        Swal.fire({
          title: "Apakah Anda yakin?",
          text: `Hapus produk "${rowData.nama}" dari daftar?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Ya, Hapus!",
          cancelButtonText: "Batal",
          customClass: { popup: 'ads-modal' }
        }).then((result) => {
          if (result.isConfirmed) {
            produk = produk.filter(p => p.id !== rowData.id);
            tabelProduk.replaceData(produk);
            applyFilter();
            
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Data berhasil dihapus',
              showConfirmButton: false,
              timer: 2000,
              customClass: { popup: 'ads-flag' }
            });
          }
        });
      },
      width: 70,
      hozAlign: 'center',
      headerSort: false
    }
  ]
});

// ---------- 5. FLOATING UI (Tooltip Info pada Tombol) ----------
const { computePosition, autoUpdate, offset, flip, shift } = window.FloatingUIDOM;
const tooltip = document.getElementById('tooltip');
let stopAutoUpdate = null;

document.querySelectorAll('.icon-btn[data-tip]').forEach(btn => {
  const text = btn.getAttribute('data-tip');

  const show = () => {
    tooltip.textContent = text;
    tooltip.style.opacity = '1';
    stopAutoUpdate = autoUpdate(btn, tooltip, () => {
      computePosition(btn, tooltip, {
        placement: 'top',
        middleware: [offset(8), flip(), shift({ padding: 8 })]
      }).then(({ x, y }) => {
        Object.assign(tooltip.style, { left: `${x}px`, top: `${y}px` });
      });
    });
  };

  const hide = () => {
    tooltip.style.opacity = '0';
    if (stopAutoUpdate) {
      stopAutoUpdate();
      stopAutoUpdate = null;
    }
  };

  ['mouseenter', 'focus'].forEach(ev => btn.addEventListener(ev, show));
  ['mouseleave', 'blur'].forEach(ev => btn.addEventListener(ev, hide));
});

// ---------- PROMO MINGGU INI ----------
const promoList = [
  { emoji: '🍜', title: 'Senin Hemat', desc: 'Mie Ayam cuma Rp7.000', lozenge: 'yellow', tag: 'Diskon' },
  { emoji: '🧋', title: 'Rabu Segar', desc: 'Es Teh Manis beli 2 cuma Rp5.000', lozenge: 'teal', tag: 'Promo' },
  { emoji: '🍌', title: 'Jumat Berkah', desc: 'Pisang Goreng gratis untuk pembeli pertama', lozenge: 'red', tag: 'Spesial' }
];

const ulPromo = document.getElementById('promo');
promoList.forEach(p => {
  const li = document.createElement('li');
  li.innerHTML = `
    <div class="p-emoji" style="background:var(--ds-background-neutral)">${p.emoji}</div>
    <div class="p-body">
      <b>${p.title} <span class="lozenge ${p.lozenge}">${p.tag}</span></b>
      <small>${p.desc}</small>
    </div>
  `;
  ulPromo.appendChild(li);
});
document.getElementById('pCount').textContent = `${promoList.length} promo`;

// ---------- FUNGSI UTAMA: applyFilter (Dinamis & Reaktif) ----------
function applyFilter() {
  const data = dataTerfilter();
  let omzet = 0, item = 0;

  data.forEach(t => {
    const p = cariProduk(t.produkId);
    if (p) {
      omzet += p.harga * t.qty;
      item += t.qty;
    }
  });

  // Update Kartu KPI
  document.getElementById('kOmzet').textContent = rupiah(omzet);
  document.getElementById('kItem').textContent = item + ' porsi';
  document.getElementById('kTrx').textContent = data.length + ' trx';

  // Hitung Omzet Harian secara Dinamis Berdasarkan Filter yang Aktif
  const harianData = [0, 0, 0, 0, 0, 0, 0];
  
  data.forEach(t => {
    const diffTime = Math.abs(state.akhir - new Date(t.tgl));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 7) {
      const p = cariProduk(t.produkId);
      if (p) {
        const index = 6 - diffDays;
        harianData[index] += p.harga * t.qty;
      }
    }
  });

  grafikBar.data.datasets[0].data = harianData;
  grafikBar.update();

  // Update Kategori Item untuk Grafik Donat
  let katCount = { Makanan: 0, Minuman: 0, Snack: 0 };
  data.forEach(t => {
    const p = cariProduk(t.produkId);
    if (p && katCount[p.kategori] !== undefined) {
      katCount[p.kategori] += t.qty;
    }
  });
  grafikDn.data.datasets[0].data = [katCount.Makanan, katCount.Minuman, katCount.Snack];
  grafikDn.update();

  // Update Informasi Header Tanggal
  const optDate = { day: 'numeric', month: 'short', year: 'numeric' };
  document.getElementById('dRange').textContent = `${state.awal.toLocaleDateString('id-ID', optDate)} – ${state.akhir.toLocaleDateString('id-ID', optDate)}`;
  document.getElementById('tCount').textContent = `${produk.length} produk`;
}

// ---------- TOGGLE DARK / LIGHT MODE ----------
const btnTheme = document.getElementById('btnTheme');
btnTheme.addEventListener('click', () => {
  const currentMode = document.documentElement.getAttribute('data-color-mode');
  const newMode = currentMode === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-color-mode', newMode);
  try { localStorage.setItem('kantin-color-mode', newMode); } catch (e) {}
  btnTheme.querySelector('span').textContent = newMode === 'dark' ? 'Mode terang' : 'Mode gelap';
});

// Jalankan filter pertama kali saat halaman dimuat
applyFilter();