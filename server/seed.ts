import type { Book } from '../src/types/library.ts';

export const SEED_BOOKS: Book[] = [
  {
    id: 'bk-001',
    title: 'Jejak Maritim Nusantara',
    subtitle: 'Pelayaran Niaga, Pelabuhan Kosmopolitan, dan Diplomasi Samudra Abad XV–XVII',
    author: 'Prof. Dr. Haryanto Kusumo',
    publisher: 'Balai Pustaka Sejarah',
    year: 2024,
    isbn: '978-602-481-902-1',
    callNumber: '959.801 KUS j',
    category: 'Sejarah & Budaya',
    format: 'Buku Cetak',
    language: 'Indonesia',
    pages: 412,
    shelfLocation: 'Lantai 2 · Rak A-04',
    totalCopies: 4,
    availableCopies: 3,
    borrowCount: 48,
    coverImage: '/src/assets/images/cover_archipelago_history_1795658419220.jpg',
    coverTone: 'ivory',
    synopsis:
      'Kajian mendalam tentang jaringan pelayaran niaga antarpulau di Nusantara sebelum kedatangan kongsi dagang Eropa. Memadukan catatan syahbandar, peta laut kuno, dan arkeologi bawah air dari Selat Malaka hingga Kepulauan Banda.',
    chapters: [
      {
        number: 'Bab I',
        title: 'Angin Muson dan Kalender Pelayaran',
        paragraphs: [
          'Sejak abad kelima belas, ritme perdagangan di kepulauan Nusantara tidak ditentukan oleh garis batas administratif, melainkan oleh perputaran angin muson barat dan muson timur. Para nakhoda dari Gresik, Makassar, dan Pasai membaca perubahan arus laut dengan ketepatan yang diwariskan lintas generasi.',
          'Pelabuhan-pelabuhan seperti Banten, Tuban, dan Ternate tumbuh menjadi ruang perjumpaan kosmopolitan. Di sepanjang dermaga kayu ulin, syahbandar mencatat muatan lada, pala, cengkih, kain patola Gujarat, serta keramik Dinasti Ming dalam pembukuan dwibahasa.',
          'Buku ini merekonstruksi kembali logika navigasi bahari yang menopang kedaulatan maritim Nusantara sekaligus memperlihatkan bagaimana hukum laut lokal menjaga keteraturan niaga lintas samudra.'
        ]
      },
      {
        number: 'Bab II',
        title: 'Syahbandar dan Tata Niaga Bandar',
        paragraphs: [
          'Jabatan syahbandar merupakan simpul diplomasi paling krusial di kota pelabuhan. Selain memungut bea masuk yang adil bagi kapal asing maupun perahu pinisi domestik, syahbandar berperan sebagai penengah sengketa dagang dan penjaga gudang penyimpanan rempah.',
          'Catatan arsip menunjukkan bahwa kota-kota bandar menerapkan sistem timbangan terstandar serta perlindungan hukum bagi awak kapal yang singgah selama musim jeda angin.'
        ]
      }
    ],
    createdAt: '2025-01-10T08:00:00.000Z'
  },
  {
    id: 'bk-002',
    title: 'Paviliun Cahaya & Iklim Tropis',
    subtitle: 'Rekam Jejak Arsitektur Modernis Nusantara 1955–1985',
    author: 'Ar. Nadia Larasati, M.Arch.',
    publisher: 'Penerbit Ruang Karya',
    year: 2023,
    isbn: '978-623-712-440-8',
    callNumber: '720.9598 LAR p',
    category: 'Arsitektur & Desain',
    format: 'E-Book',
    language: 'Indonesia',
    pages: 288,
    shelfLocation: 'Repositori Digital · Koleksi AR-12',
    totalCopies: 6,
    availableCopies: 5,
    borrowCount: 62,
    coverImage: '/src/assets/images/cover_tropical_architecture_1795658420015.jpg',
    coverTone: 'stone',
    synopsis:
      'Monograf arsitektur yang menelaah bagaimana generasi awal arsitek pascakemerdekaan menerjemahkan prinsip modernisme ke dalam konteks iklim tropis lembap melalui kisi-kisi beton, ventilasi silang, dan teras teduh.',
    chapters: [
      {
        number: 'Bab I',
        title: 'Kisi-Kisi Beton sebagai Kulit Bangunan',
        paragraphs: [
          'Di kawasan khatulistiwa, dinding kaca masif sering kali berubah menjadi perangkap panas. Para arsitek modernis awal di Bandung, Jakarta, dan Surabaya menanggapi persoalan ini dengan merancang fasad ganda berupa kisi-kisi beton pracetak atau roster bata terakota.',
          'Elemen tersebut tidak hanya menyaring sinar matahari langsung yang menyilaukan, tetapi juga menjaga aliran udara alami tetap bergerak menembus ruang kerja dan ruang kuliah tanpa bergantung penuh pada pendingin mekanis.',
          'Estetika bayangan yang lahir dari perubahan sudut matahari dari pagi hingga petang menjadi bahasa visual yang khas dalam arsitektur publik Indonesia.'
        ]
      },
      {
        number: 'Bab II',
        title: 'Serambi, Atap Pelana, dan Ruang Publik',
        paragraphs: [
          'Transformasi pendopo dan serambi rumah tradisional ke dalam gedung kampus, perpustakaan, serta balai kota memperlihatkan kepekaan sosial terhadap iklim hujan tropis. Overstek atap yang lebar mengundang pejalan kaki berteduh sekaligus menjadi ruang diskusi informal.'
        ]
      }
    ],
    createdAt: '2025-01-14T09:30:00.000Z'
  },
  {
    id: 'bk-003',
    title: 'Arsitektur Sistem Terdistribusi Modern',
    subtitle: 'Konsensus, Replikasi Data, dan Ketahanan Infrastruktur Skala Besar',
    author: 'Dr. Bagus Prakoso & Rina Wijaya',
    publisher: 'Pustaka Informatika ITB',
    year: 2025,
    isbn: '978-623-880-119-4',
    callNumber: '004.36 PRA a',
    category: 'Teknologi & Komputasi',
    format: 'E-Book',
    language: 'Indonesia',
    pages: 534,
    shelfLocation: 'Repositori Digital · Koleksi TI-03',
    totalCopies: 8,
    availableCopies: 7,
    borrowCount: 91,
    coverImage: '/src/assets/images/cover_computing_systems_1795658420202.jpg',
    coverTone: 'lapis',
    synopsis:
      'Referensi komprehensif bagi mahasiswa ilmu komputer dan insinyur perangkat lunak mengenai teori serta praktik sistem terdistribusi, mulai dari jam logis Lamport, algoritma Raft, partisi data, hingga pola pemulihan kegagalan.',
    chapters: [
      {
        number: 'Bab I',
        title: 'Ilusi Waktu Tunggal dalam Jaringan',
        paragraphs: [
          'Ketika ratusan peladen beroperasi di pusat data terpisah, tidak ada jam fisik yang dapat dijadikan acuan urutan peristiwa secara mutlak. Pergeseran kuarsa dan latensi paket jaringan membuat dua mesin dapat mencatat urutan kejadian yang saling bertentangan.',
          'Oleh karena itu, rancangan sistem terdistribusi yang andal bertumpu pada hubungan sebab-akibat logis melalui Lamport timestamps dan vector clocks. Pemahaman ini merupakan fondasi sebelum melangkah ke protokol replikasi dan konsensus.'
        ]
      },
      {
        number: 'Bab II',
        title: 'Konsensus Raft dan Ketahanan Partisi',
        paragraphs: [
          'Algoritma Raft memisahkan persoalan konsensus menjadi pemilihan pemimpin (leader election), replikasi log, dan jaminan keamanan state machine. Dengan pemisahan tanggung jawab ini, pengembang lebih mudah memverifikasi kebenaran sistem saat terjadi partisi jaringan.'
        ]
      }
    ],
    createdAt: '2025-01-20T11:15:00.000Z'
  },
  {
    id: 'bk-004',
    title: 'Antologi Prosa Kota Hujan',
    subtitle: 'Dua Belas Cerita Tentang Ingatan, Stasiun Tua, dan Taman Botani',
    author: 'Siti Aisyah Mahendra',
    publisher: 'Lentera Sastra',
    year: 2023,
    isbn: '978-602-335-712-9',
    callNumber: '899.2213 MAH a',
    category: 'Sastra & Fiksi',
    format: 'Buku Cetak',
    language: 'Indonesia',
    pages: 224,
    shelfLocation: 'Lantai 1 · Rak F-08',
    totalCopies: 3,
    availableCopies: 2,
    borrowCount: 74,
    coverImage: '/src/assets/images/cover_literary_anthology_1795658420627.jpg',
    coverTone: 'forest',
    synopsis:
      'Kumpulan dua belas cerita pendek berlatar kota Bogor pada peralihan dekade. Dengan prosa yang hening dan terukur, buku ini menelusuri jejak persahabatan, surat-surat yang tertinggal di ruang arsip, dan aroma tanah basah selepas hujan sore.',
    chapters: [
      {
        number: 'Cerita 01',
        title: 'Penjaga Herbarium di Sayap Timur',
        paragraphs: [
          'Setiap pukul empat sore, ketika kabut tipis mulai turun menyentuh pucuk damar di seberang jalan, Pak Darmo selalu menyalakan lampu meja kuningan di sudut ruang pengeringan spesimen. Di antara lemari kayu kamper berisi daun-daun berusia seabad, ia menyimpan catatan tangan para peneliti yang telah lama berpulang.',
          'Suatu hari seorang mahasiswa botani menemukan sehelai kartu pos tertanggal November 1968 terselip di balik map spesimen pakis gunung. Dari kartu pos itulah percakapan panjang tentang sejarah taman kota dan kenangan keluarga perlahan terbuka.'
        ]
      }
    ],
    createdAt: '2025-01-24T14:00:00.000Z'
  },
  {
    id: 'bk-005',
    title: 'Ekonomi Sirkular & Industri Daerah',
    subtitle: 'Strategi Pengelolaan Limbah Produktif untuk UMKM Manufaktur',
    author: 'Dr. Hendra Gunawan, M.Ec.',
    publisher: 'LP3ES Nusantara',
    year: 2024,
    isbn: '978-623-552-180-2',
    callNumber: '338.9598 GUN e',
    category: 'Ekonomi & Kebijakan',
    format: 'Jurnal Digital',
    language: 'Indonesia',
    pages: 196,
    shelfLocation: 'Repositori Digital · Koleksi EK-19',
    totalCopies: 5,
    availableCopies: 5,
    borrowCount: 33,
    coverTone: 'terracotta',
    synopsis:
      'Studi empiris terhadap 42 sentra UMKM tekstil, kayu, dan pangan olahan di Jawa Tengah dan Jawa Timur dalam menerapkan rantai pasok tertutup untuk menekan biaya bahan baku sekaligus mengurangi limbah cair dan padat.',
    chapters: [
      {
        number: 'Ringkasan Eksekutif',
        title: 'Transisi dari Model Linear ke Sirkular',
        paragraphs: [
          'Sebagian besar pelaku usaha kecil masih memandang pengelolaan residu produksi semata sebagai pos beban biaya lingkungan. Padahal, integrasi antarsentra memungkinkan sisa potongan kayu jati, ampas kedelai, dan residu serat alami diolah kembali menjadi produk bernilai tambah tinggi.',
          'Laporan ini memetakan insentif pembiayaan hijau daerah serta standar koperasi bahan baku bersama yang terbukti menurunkan biaya produksi hingga delapan belas persen dalam dua tahun.'
        ]
      }
    ],
    createdAt: '2025-02-01T10:00:00.000Z'
  },
  {
    id: 'bk-006',
    title: 'Ekologi Terumbu Karang Wallacea',
    subtitle: 'Panduan Lapangan Biodiversitas & Pemulihan Terumbu Timur Indonesia',
    author: 'Dr. Melati Sitorus & Tim Oseanografi',
    publisher: 'Yayasan Sains Bahari',
    year: 2024,
    isbn: '978-623-901-331-5',
    callNumber: '577.789 SIT e',
    category: 'Sains & Ekologi',
    format: 'E-Book',
    language: 'Indonesia',
    pages: 340,
    shelfLocation: 'Repositori Digital · Koleksi SN-07',
    totalCopies: 5,
    availableCopies: 4,
    borrowCount: 41,
    coverTone: 'lapis',
    synopsis:
      'Dokumentasi ekologi terumbu karang di kawasan Segitiga Karang Wallacea mencakup identifikasi 180 spesies karang keras, metode pemantauan pemutihan akibat suhu laut, serta protokol rehabilitasi berbasis masyarakat pesisir.',
    chapters: [
      {
        number: 'Bab I',
        title: 'Jantung Keanekaragaman Hayati Laut',
        paragraphs: [
          'Perairan di antara Sulawesi, Maluku, dan Nusa Tenggara menyimpan konsentrasi spesies karang dan ikan karang tertinggi di planet ini. Pertemuan arus pasifik melalui Alur Lintas Indonesia membawa nutrien sekaligus larva biota laut yang memperkaya ekosistem pesisir.',
          'Pemantauan berkala menggunakan transek foto bawah air memberikan data dasar penting bagi pengelola taman laut dalam menjaga keseimbangan ekologi dan perikanan berkelanjutan.'
        ]
      }
    ],
    createdAt: '2025-02-05T08:45:00.000Z'
  },
  {
    id: 'bk-007',
    title: 'Manuskrip Aksara Kawi & Lontar Bali',
    subtitle: 'Katalog Deskriptif Naskah Abad XVIII Koleksi Ruang Langka',
    author: 'Drs. I Made Suartana',
    publisher: 'Pusat Pelestarian Naskah',
    year: 2021,
    isbn: '978-602-119-084-3',
    callNumber: '091.9598 SUA m',
    category: 'Sejarah & Budaya',
    format: 'Arsip Langka',
    language: 'Indonesia / Kawi',
    pages: 318,
    shelfLocation: 'Ruang Naskah Langka · Lemari L-02',
    totalCopies: 2,
    availableCopies: 1,
    borrowCount: 27,
    coverTone: 'charcoal',
    synopsis:
      'Katalog kritis berisi transliterasi dan anotasi filologis atas empat puluh delapan cakep lontar bertema pengobatan tradisional (usada), tata ruang bangunan (asta kosala kosali), serta kidung keagamaan.',
    chapters: [
      {
        number: 'Pengantar Filologi',
        title: 'Konservasi Daun Siwalan dan Tinta Kemiri',
        paragraphs: [
          'Naskah lontar ditulis menggunakan pisau pengutik di atas lembaran daun siwalan yang telah direbus, dikeringkan, dan dipres selama berbulan-bulan. Goresan aksara kemudian dipertegas menggunakan jelaga kemiri bakar agar kontras dan tahan terhadap kelembapan tropis.',
          'Digitalisasi resolusi tinggi dalam katalog ini memungkinkan peneliti membaca detail kolofon penanggalan Saka tanpa perlu sering menyentuh lembar fisik yang rapuh.'
        ]
      }
    ],
    createdAt: '2025-02-08T13:20:00.000Z'
  },
  {
    id: 'bk-008',
    title: 'Tipografi Editorial & Tata Letak Buku',
    subtitle: 'Proporsi Halaman Klasik, Grid Swiss, dan Keterbacaan Digital',
    author: 'Dian Pramesti, M.Ds.',
    publisher: 'Studio Grafis Aksara',
    year: 2024,
    isbn: '978-623-410-892-7',
    callNumber: '686.22 PRA t',
    category: 'Arsitektur & Desain',
    format: 'Buku Cetak',
    language: 'Indonesia',
    pages: 264,
    shelfLocation: 'Lantai 2 · Rak D-11',
    totalCopies: 3,
    availableCopies: 0,
    borrowCount: 55,
    coverTone: 'ivory',
    synopsis:
      'Panduan praktis perancangan publikasi cetak maupun bacaan digital: mulai dari konstruksi kanon halaman Van de Graaf, pemilihan pasangan huruf serif-sans, hingga ritme spasi baris untuk kenyamanan membaca jangka panjang.',
    chapters: [
      {
        number: 'Bab I',
        title: 'Anatomi Panjang Baris dan Irama Mata',
        paragraphs: [
          'Kenyamanan membaca bukan sekadar soal ukuran huruf yang besar. Ketika panjang baris melampaui delapan puluh karakter, mata pembaca kehilangan jangkar saat berpindah ke awal baris berikutnya; sebaliknya, baris yang terlalu sempit memutus alur kalimat secara paksa.',
          'Rentang ideal antara enam puluh hingga tujuh puluh dua karakter per baris, dipadukan dengan spasi antarbaris sekitar 1,65 kali ukuran huruf, menciptakan tempo membaca yang tenang dan berkelanjutan.'
        ]
      }
    ],
    createdAt: '2025-02-11T15:10:00.000Z'
  },
  {
    id: 'bk-009',
    title: 'Rekayasa Bahasa Alamiah Bahasa Daerah',
    subtitle: 'Korpus Paralel, Tokenisasi Morfologis, dan Pelestarian Digital',
    author: 'Dr. Farah Diba & Arif Budiman',
    publisher: 'Laboratorium Bahasa & AI',
    year: 2025,
    isbn: '978-623-994-210-6',
    callNumber: '006.35 DIB r',
    category: 'Teknologi & Komputasi',
    format: 'Jurnal Digital',
    language: 'Indonesia',
    pages: 178,
    shelfLocation: 'Repositori Digital · Koleksi TI-14',
    totalCopies: 6,
    availableCopies: 6,
    borrowCount: 38,
    coverTone: 'lapis',
    synopsis:
      'Monograf riset tentang pembangunan korpus paralel untuk bahasa Jawa, Sunda, Bugis, dan Minangkabau guna mendukung mesin penerjemah serta kamus digital berbasis komunitas penutur asli.',
    chapters: [
      {
        number: 'Bagian 1',
        title: 'Tantangan Sumber Daya Rendah pada Bahasa Nusantara',
        paragraphs: [
          'Dari lebih dari tujuh ratus bahasa daerah di Indonesia, hanya segelintir yang memiliki data teks terstandar dalam jumlah memadai untuk pemodelan komputasional modern. Variasi dialek dan sistem afiksasi yang kaya menuntut pendekatan morfologis yang cermat.',
          'Melalui kolaborasi dengan guru bahasa daerah dan komunitas sastra lisan, tim peneliti berhasil menghimpun lebih dari dua ratus ribu kalimat teranotasi dengan lisensi terbuka.'
        ]
      }
    ],
    createdAt: '2025-02-14T09:00:00.000Z'
  },
  {
    id: 'bk-010',
    title: 'Surat dari Lereng Merapi',
    subtitle: 'Novel tentang Peta Geologi, Arsip Desa, dan Ketangguhan Warga',
    author: 'Yusuf Alamsyah',
    publisher: 'Pustaka Narasi',
    year: 2022,
    isbn: '978-602-540-318-0',
    callNumber: '899.2213 ALA s',
    category: 'Sastra & Fiksi',
    format: 'E-Book',
    language: 'Indonesia',
    pages: 306,
    shelfLocation: 'Repositori Digital · Koleksi SS-22',
    totalCopies: 5,
    availableCopies: 4,
    borrowCount: 67,
    coverTone: 'forest',
    synopsis:
      'Kisah seorang juru arsip muda yang ditugaskan menyelamatkan dokumen pertanahan dan catatan curah hujan desa-desa di lereng gunung api aktif, di mana pengetahuan lokal berpadu dengan sains modern.',
    chapters: [
      {
        number: 'Bab I',
        title: 'Peti Seng di Balai Desa',
        paragraphs: [
          'Ketika Raka membuka peti seng hijau yang tersimpan di gudang balai desa selama hampir empat puluh tahun, bau kertas tua dan kapur barus langsung menyergap. Di dalamnya tersusun rapi buku register tanah tahun 1952 beserta sketsa jalur evakuasi warga.',
          'Setiap halaman bertinta biru itu menyimpan jejak gotong royong masyarakat menghadapi perubahan bentang alam dari generasi ke generasi.'
        ]
      }
    ],
    createdAt: '2025-02-18T12:00:00.000Z'
  },
  {
    id: 'bk-011',
    title: 'Tata Kelola Kota & Transportasi Publik',
    subtitle: 'Integrasi Moda, Ruang Pejalan Kaki, dan Pembiayaan Transit',
    author: 'Ir. Bambang Suryadi, M.Sc.',
    publisher: 'Penerbit Perkotaan',
    year: 2024,
    isbn: '978-623-774-019-9',
    callNumber: '388.4 SUR t',
    category: 'Ekonomi & Kebijakan',
    format: 'Buku Cetak',
    language: 'Indonesia',
    pages: 356,
    shelfLocation: 'Lantai 3 · Rak K-02',
    totalCopies: 3,
    availableCopies: 2,
    borrowCount: 29,
    coverTone: 'terracotta',
    synopsis:
      'Analisis kebijakan mobilitas perkotaan di kota-kota menengah Indonesia dengan penekanan pada integrasi tarif antarmoda, revitalisasi trotoar teduh, dan pemanfaatan nilai lahan di sekitar simpul transit.',
    chapters: [
      {
        number: 'Bab I',
        title: 'Mengukur Aksesibilitas, Bukan Sekadar Kecepatan',
        paragraphs: [
          'Selama puluhan tahun perencanaan jalan perkotaan terjebak pada pelebaran ruas demi mengejar kecepatan kendaraan pribadi. Akibatnya, ruang jalan menyempit bagi pejalan kaki dan waktu tempuh justru semakin tidak menentu.',
          'Pergeseran paradigma menuju kota berorientasi transit menempatkan kemudahan warga menjangkau tempat kerja, sekolah, dan fasilitas kesehatan dalam jarak berjalan kaki sebagai ukuran keberhasilan utama.'
        ]
      }
    ],
    createdAt: '2025-02-20T16:30:00.000Z'
  },
  {
    id: 'bk-012',
    title: 'Botani Rempah & Sejarah Pengobatan',
    subtitle: 'Atlas Ilmiah Pala, Cengkih, Kayu Manis, dan Tanaman Obat Tropis',
    author: 'Prof. Ratna Wijayanti',
    publisher: 'Pustaka Hayati Bogor',
    year: 2023,
    isbn: '978-602-887-642-4',
    callNumber: '581.634 WIJ b',
    category: 'Sains & Ekologi',
    format: 'Buku Cetak',
    language: 'Indonesia',
    pages: 392,
    shelfLocation: 'Lantai 2 · Rak S-05',
    totalCopies: 4,
    availableCopies: 3,
    borrowCount: 44,
    coverTone: 'stone',
    synopsis:
      'Ensiklopedia ringkas yang memadukan deskripsi taksonomi botani, profil senyawa aktif aromatik, serta riwayat pemanfaatan tanaman rempah Nusantara dalam pengobatan tradisional dan farmakognosi modern.',
    chapters: [
      {
        number: 'Bab I',
        title: 'Minyak Atsiri sebagai Pertahanan Tumbuhan',
        paragraphs: [
          'Aroma khas yang muncul ketika kulit kayu manis atau biji pala digerus sesungguhnya merupakan hasil evolusi kimiawi tumbuhan untuk melindungi diri dari serangga dan patogen tropis.',
          'Dalam takaran yang terukur, senyawa fenolik dan terpenoid tersebut memberi nilai guna tinggi bagi pangan, pengawetan alami, dan pengembangan fitofarmaka berbasis riset.'
        ]
      }
    ],
    createdAt: '2025-02-22T10:15:00.000Z'
  }
];
