window.onload = function() {
    let btnCal = document.getElementById('btnCalculate');
    
    btnCal.addEventListener('click', function() {
    	document.getElementById('loggerDiv').innerHTML = '';

    	let Q = document.getElementById('inpQ').value;
    	let F = document.getElementById('inpF').value;
    	console.log(Q, F);
    	pttk = new PTTK(Q, F);

    	let kq = pttk.timTatCaKhoa(document.getElementById('chbHienCachLam').checked);
    	document.getElementById('txKetQua').innerHTML = kq.toString();
    })
    btnCal.click();

    document.getElementById('btnXoaLogger')
    	.addEventListener('click', function() {
    		document.getElementById('loggerDiv').innerHTML = '';
    	})
}

/*

R : lược đồ (danh sách tất cả thuộc tính)
F : tập các phụ thuộc hàm
Farr: tập các phụ thuộc hàm ở dạng mảng
f : phụ thuộc hàm (bên trong F)
a : thuộc tính

*/

function gopCacPhuThuocHam(listF, kiTuPhanCach = ',', kiTuSuyRa = '->') {
    let result = '';

    for (let f of listF) {
        result += f.from + kiTuSuyRa + f.to + kiTuPhanCach;
    }
    result = result.substring(0, result.length - 1);

    return result;
}

function tachCacPhuThuocHam(F, kiTuPhanCach = ',', kiTuSuyRa = '->') {
    let listF = F.split(kiTuPhanCach);
    let result = [];

    for (let f of listF) {
        let fsplit = f.split(kiTuSuyRa),
            left = fsplit[0],
            right = fsplit[1];

        result.push({
            from: left,
            to: right
        });
    }

    return result;
}

function coChuaThuocTinh(a, chuoiCanXet) {
    for (let c of a) { // char of a (a is a string)
        if (!chuoiCanXet.includes(c)) {
            return false;
        }
    }

    return true;
}

// ==============================\
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class PTTK {
    /*
    	_R: danh sách thuộc tính của lược đồ này (dạng chuỗi)
    	_F: tập phụ thuộc hàm (dạng chuỗi)
    */
    constructor(_R, _F) {
        this.R = sortString(_R);
        this.F = tachCacPhuThuocHam(_F);
    }

    timBaoDong(thuocTinh, _isLog) {
    	let logger = '';

        let baoDong = '' + thuocTinh;

        while (true) {
            let coThuocTinhThoa = false;
            for (let f of this.F) {
                if (coChuaThuocTinh(f.from, baoDong)) {

                    if (!coChuaThuocTinh(f.to, baoDong)) {
                        logger += (`Có ${f.from} trong Bao đóng ${baoDong} và ${f.from}->${f.to}: `);

                        coThuocTinhThoa = true;
                        // baoDong = themThuocTinh(f.to, baoDong);

                        for (let c of f.to) {
                            if (baoDong.includes(c)) {
                                logger += (` + Đã có ${c} trong bao đóng`)
                            } else {
                                logger += (` + Thêm ${c} vào bao đóng`);
                                baoDong += c;
                            }
                        }

                        logger += (`-------- Bao đóng hiện tại: ${baoDong}`);
                    }
                }
            }

            if (baoDong == this.R || !coThuocTinhThoa) {
                break;
            }
        }

        _isLog && log(logger);

        return baoDong;
    }

    kiemTraSuyDan(_f, _isLog) {
    	let logger = '';
        let f = tachCacPhuThuocHam(_f)[0];
        let baoDong = this.timBaoDong(f.from);
        let F_str = gopCacPhuThuocHam(this.F);

        if (baoDong.includes(f.to)) {
            logger += (`Có ${f.to} trong bao đóng của ${f.from}: ${baoDong}`);
            logger += (`Vậy ${_f} được suy ra từ F: {${F_str}}`);
            _isLog && log(logger);
            return true;
        } else {
            logger += (`Không Có ${f.to} trong bao đóng của ${f.from}: ${baoDong}`);
            logger += (`Vậy ${_f} KHÔNG được suy ra từ F: {${F_str}}`);
            _isLog && log(logger);
            return false;
        }
    }

    timTatCaKhoa(_isLog) {
        let sieuKhoaLonNhat = '';
        for (let f of this.F) {
            for (let c of f.from) {
                if (!sieuKhoaLonNhat.includes(c))
                    sieuKhoaLonNhat += c;
            }
        }

        switch (document.getElementById('kieuTim').value) {
        	case 'thayNam':
        		return this.timTatCaKhoa_tuSieuKhoa(sieuKhoaLonNhat, _isLog);
        		break;

        	case 'deQuy':
        		return this.timTatCaKhoa_tuSieuKhoa_DeQuy(sieuKhoaLonNhat, _isLog);
        		break;
        	case 'lapBang':
        		return this.timTatCaKhoa_tuSieuKhoa_Bang(sieuKhoaLonNhat, _isLog);
        		break;
        	default:
        		// statements_def
        		break;
        }
    }

    timTatCaKhoa_tuSieuKhoa(_sieuKhoa, _isLog) {
    	let logger = '';
        let sieuKhoaCanXet = [_sieuKhoa];
        let khoaTimDuoc = [];

        // Khi vẫn còn siêu khóa cần xét
        while (sieuKhoaCanXet.length) {

            // Mảng lưu trữ các siêu khóa con tìm được
            let cacSieuKhoaConTimDuoc = [];

            // Duyệt mảng siêu khóa cần xét
            for (let sieuKhoa of sieuKhoaCanXet) {

                logger += (`Xét siêu khóa <u><b>${sieuKhoa}</b></u>:<br>`);

                // Mảng lưu trữ các siêu khóa con tìm được
                let sieuKhoaCon = [];

                // Mảng các tập con (chiều dài = chiều dài siêu khóa - 1)
                let cacTapCon = lietKeTapCon(sieuKhoa, sieuKhoa.length - 1);

                // Duyệt các tập con của siêu khóa hiện tại
                for (let tapcon of cacTapCon) {

                    // Tìm bao đóng, và sắp xếp tăng dần, để dễ so sánh với R (do R đã đc sắp xếp) 
                    let baoDongTapCon = sortString(this.timBaoDong(tapcon));

                    // Là siêu khóa nếu bao đóng của tập con = R
                    if (baoDongTapCon == this.R) {

                        logger += (` ${tapcon}+ = ${baoDongTapCon} = R<br>`);
                        // Thêm tập con này vào mảng lưu trữ siêu khóa con
                        sieuKhoaCon.push(tapcon);

                    } else {
                        logger += (` ${tapcon}+ = ${baoDongTapCon}<br>`)
                    }
                }

                if (sieuKhoaCon.length) {
                    logger += (`=> Các siêu khóa con: <b>${sieuKhoaCon.toString()}</b><br><br>`);

                    for (let skc of sieuKhoaCon) {
                        // Nếu chưa có siêu khóa con này trong mảng, thì thêm vào cuối mảng
                        if (cacSieuKhoaConTimDuoc.indexOf(skc) < 0) {
                            cacSieuKhoaConTimDuoc.push(skc);
                        }
                    }

                } else {
                    // Nếu không có siêu khóa con nào => siêu khóa hiện tại chính là khóa
                    khoaTimDuoc.push(sieuKhoa);
                }
            }

            /* Sau khi duyệt hết mảng thì các siêu khóa cần xét tiếp theo 
            chính là các siêu khóa con tìm được */
            sieuKhoaCanXet = cacSieuKhoaConTimDuoc;
        }

        _isLog && log(logger);

        return khoaTimDuoc;
    }

    timTatCaKhoa_tuSieuKhoa_DeQuy(_sieuKhoa, _isLog) {
    	let logger = '';
        logger += (`Xét siêu khóa <b>${_sieuKhoa}</b>:<br>`);

        // Mảng lưu trữ siêu khóa con tìm được từ siêu khóa truyền vào
        let sieuKhoaCon = [];

        // Các tập con tách được từ siêu khóa truyền vào
        let cacTapCon = lietKeTapCon(_sieuKhoa, _sieuKhoa.length - 1);

        // Duyệt qua tất cả tập con
        for (let tapcon of cacTapCon) {

            // Tìm bao đóng của tập con và sắp xếp tăng dần (cho dễ so sánh với R)
            let baoDongTapCon = sortString(this.timBaoDong(tapcon));

            // Nếu bao đóng == R => tập con là siêu khóa
            if (baoDongTapCon == this.R) {
                // Log thông báo nếu cần
                logger += (` ${tapcon}+ = ${baoDongTapCon} = R<br>`)
                    // Thêm siêu khóa con này vào mảng
                sieuKhoaCon.push(tapcon);
            } else {
                // Log kết quả bao đóng nếu cần
                logger += (` ${tapcon}+ = ${baoDongTapCon}<br>`)
            }
        }

        if (sieuKhoaCon.length == 0) {
            // Nếu không có tập con nào là siêu khóa 
            // => siêu khóa truyền vào chính là khóa
            // => Trả về khóa.
            logger += (`==============> KHÓA LÀ : ${_sieuKhoa}<br>`);

            _isLog && log(logger);
            return [_sieuKhoa];
        } else {
            // Ngược lại log kết quả các siêu khóa con tìm được
            logger += (`=> Siêu khóa con: ${sieuKhoaCon.toString()}<br>`);
        }

		_isLog && log(logger);

        // Mảng kết quả lưu trữ khóa
        let khoaTimDuoc = [];

        // Duyệt tất cả siêu khóa con tìm được
        for (let s of sieuKhoaCon) {

            // Đệ quy - tìm khóa từ các siêu khóa con tìm được
            let khoaCon = this.timTatCaKhoa_tuSieuKhoa_DeQuy(s, _isLog);

            // Duyệt mảng khóa tìm được, cho vào mảng khoaTimDuoc nếu chưa có
            for (let k of khoaCon) {
                if (khoaTimDuoc.indexOf(k) < 0) {
                    khoaTimDuoc.push(k);
                }
            }
        }

        // Trả về mảng khóa
        return khoaTimDuoc;
    }

    timTatCaKhoa_tuSieuKhoa_Bang(_sieuKhoa, _isLog) {
    	let logger = `<table style="text-align:left;margin:0">
    					<tr>
    						<th>Tập con</th>
    						<th>Bao đóng</th>
    					</tr>`;
        /* Object lưu trữ TẤT CẢ tập con của _sieuKhoa
        	Dùng object để dễ truy xuất
           các tập con có độ dài từ 1 tới _sieuKhoa.length - 1  */
        let tatCaTapCon = {};

        // Mảng lưu trữ các khóa tìm được, hàm trả về mảng này
        let khoaTimDuoc = [];

        // Vòng lặp lấy ra i = {1, ..., _sieuKhoa.length - 1}
        // => Sẽ duyệt tập con từ tập nhỏ tới tập lớn
        for (let i = 1; i < _sieuKhoa.length; i++) {

            // Với mỗi i, lấy ra tập con độ dài i từ _sieuKhoa
            let cacTapCon = lietKeTapCon(_sieuKhoa, i);

            // Duyệt mảng tập con tìm được
            for (let tapCon of cacTapCon) {

            	// Gán giá trị mặc định
            	tatCaTapCon[tapCon] = '';

                // Tìm các tập con nhỏ hơn tập này 1 bậc
                let cacTapConBacNho = lietKeTapCon(tapCon, tapCon.length - 1);

                // Duyệt tập con bậc nhỏ, tìm xem có tập nào là khóa chưa
                let loai = false;

                for (let tapConBacNho of cacTapConBacNho) {
                    // Giá trị của tập con bậc nhỏ
                    let giaTri = tatCaTapCon[tapConBacNho];

                    // So sánh giá trị, nếu là khóa hoặc đã bị loại, thì dừng lặp so sánh
                    if (giaTri == 'Khóa' || giaTri == '_') {
                        loai = tapConBacNho;
                        break;
                    }
                }

                // Nếu đã có tập con bậc nhỏ là khóa, thì không cần duyệt tập hiện tại nữa
                if (loai) {
                	// Đánh dấu (để những tập lớn hơn ko xét lại)
                	tatCaTapCon[tapCon] = '_';
                	logger += `<tr><td><del>${tapCon}</del></td> <td>_ có tập con ${loai} là khóa nên không cần xét</td>`;
                	// Chuyển qua vòng lặp tiếp theo
                	continue;
                }

                // Nếu không, Tìm bao đóng, và sắp xếp tăng dần, để dễ so sánh với R (do R đã đc sắp xếp) 
                let baoDongTapCon = sortString(this.timBaoDong(tapCon));

                logger += `<tr><td>${tapCon} </td> <td>${baoDongTapCon}`;

                // Nếu bao đóng == R
                if (baoDongTapCon == this.R) {
                    tatCaTapCon[tapCon] = 'Khóa';
                    khoaTimDuoc.push(tapCon);

                    logger += ' = R  - <b><u>Khóa</u></b>';
                }

                logger += '</td></tr>'; 
            }
        }

        logger += '</table>'

        _isLog && log(logger);

        return khoaTimDuoc;
    }

    setF(_F) {
        this.F = _F;
    }

    setR(_R) {
        this.R = _R;
    }

    getF() {
        return this.F;
    }

    getR() {
        return this.R;
    }
}


function log(str) {
    let div = document.getElementById('loggerDiv');
    div.innerHTML += `${str}<br>`;
}

// https://www.rebvn.com/2017/12/liet-ke-tap-con-k-phan-tu-bang-phuong-phap-sinh.html
function lietKeTapCon(chuoi, k) {
    let result = [];
    let n = chuoi.length;
    if (k > n) k = n;

    // khoi tao mang k phan tu
    let mang = [];

    // tap con dau tien
    let s1 = '';
    for (let i = 0; i < k; i++) {
        mang[i] = i; // khoi tao mang[i] = i;
        s1 += chuoi[mang[i]];
    }
    result.push(s1);

    // xu ly
    for (let i = k - 1; i >= 0; i--) {
        if (mang[i] < n - k + i) // neu phan tu vi tri i nho hon gia tri max tai vi tri nay
        {
            mang[i]++; // tang len 1 don vi

            for (let j = i + 1; j < k; j++) {
                mang[j] = mang[j - 1] + 1; // gan lai gia tri cho cac phan tu phia sau
            }

            // in ra bo so moi tao duoc
            let si = '';
            for (let j = 0; j < k; j++) {
                si += chuoi[mang[j]];
            }
            result.push(si);

            i = k; // gan i = k de khi het vong lap i-- nen i se = k - 1, tu do chay lai tu vi tri cuoi.
            // gan i = k - 1 la sai vi khi het vong lap hien tai i-- se thanh k - 2.
        }
    }

    return result;
}

// https://stackoverflow.com/questions/51165/how-to-sort-strings-in-javascript
function sortString(s) {
    let s_arr = s.split('');
    s_arr.sort(function(a, b) {
        return ('' + a).localeCompare(b);
    })

    return s_arr.join('');
}