var cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer')
const path = require('path')

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
    origin: '*'
}));
// script upload

app.use(express.static("./public"))
 //! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/image/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});
 

 

// create data / insert data
app.post('/api/karyawan',upload.single('image'),(req, res) => {


    const data = { ...req.body };
    const nik = req.body.nik;
    const nama = req.body.nama;
    const tanggal_masuk = req.body.tanggal_masuk;
    const tanggal_keluar = req.body.tanggal_keluar;
    const alamat = req.body.alamat;

    if (!req.file) {
        console.log("No file upload");
        const querySql = 'INSERT INTO karyawan (nik,nama,tanggal_masuk,tanggal_keluar,alamat) values (?,?,?,?,?);';
         
        // jalankan query
        koneksi.query(querySql,[ nik,nama,tanggal_masuk,tanggal_keluar,alamat], (err, rows, field) => {
            // error handling
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }
       
            // jika request berhasil
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://localhost:5000/image/' + req.file.filename;
        const foto =   imgsrc;
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySql = 'INSERT INTO karyawan (nik,nama,tanggal_masuk,tanggal_keluar,alamat,foto) values (?,?,?,?,?,?);';
 
// jalankan query
koneksi.query(querySql,[ nik,nama, tanggal_masuk,tanggal_keluar,alamat,foto], (err, rows, field) => {
    // error handling
    if (err) {
        return res.status(500).json({ message: 'Gagal insert data!', error: err });
    }

    // jika request berhasil
    res.status(201).json({ success: true, message: 'Berhasil insert data!' });
});
}
});




// read data / get data
app.get('/api/karyawan', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM karyawan';

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});


// update data
app.put('/api/karyawan/:nik', (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM karyawan WHERE nik = ?';
    const nik = req.body.nik;
    const nama = req.body.nama;
    const tanggal_masuk = req.body.tanggal_masuk;
    const tanggal_keluar = req.body.tanggal_keluar;
    const alamat = req.body.alamat;

    const queryUpdate = 'UPDATE karyawan SET nama=?,tanggal_masuk=?,tanggal_keluar=?,alamat=? WHERE nik = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.nik, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            koneksi.query(queryUpdate, [nama,tanggal_masuk,tanggal_keluar,alamat, req.params.nik], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// delete data
app.delete('/api/karyawan/:nik', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    const querySearch = 'SELECT * FROM karyawan WHERE nik = ?';
    const queryDelete = 'DELETE FROM karyawan WHERE nik = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.nik, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            koneksi.query(queryDelete, req.params.nik, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika delete berhasil
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));