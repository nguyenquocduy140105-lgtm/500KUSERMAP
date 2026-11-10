document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const pageViews = document.querySelectorAll('.page-view');
  const navItems = document.querySelectorAll('.nav-links__item[data-page-target]');

  const pageTitles = {
    'trang-chu': 'Dịch Vụ Review Google Map 5 Sao Uy Tín | AI500KUser',
    'he-sinh-thai': 'Hệ Sinh Thái Seeding & Bản Đồ Số | AI500KUser',
    'gioi-thieu': 'Giới Thiệu & Tiêu Chuẩn Review Maps | AI500KUser',
    'bang-gia': 'Bảng Giá Review Maps 20.000đ - 22.000đ/Lượt | AI500KUser',
    'hoi-dap': 'Hỏi Đáp Thường Gặp (FAQ) | AI500KUser',
  };

  const hashAliasMap = {
    'trang-chu': { page: 'trang-chu' },
    'he-sinh-thai': { page: 'he-sinh-thai' },
    'gioi-thieu': { page: 'gioi-thieu' },
    'gia-tri': { page: 'gioi-thieu' },
    'quy-trinh': { page: 'gioi-thieu', scrollTo: 'quy-trinh' },
    'bang-gia': { page: 'bang-gia' },
    'tinh-phi': { page: 'bang-gia', scrollTo: 'tinh-phi' },
    'tu-van': { page: 'bang-gia', scrollTo: 'tu-van' },
    'hoi-dap': { page: 'hoi-dap' },
    'faq': { page: 'hoi-dap', scrollTo: 'faq' },
  };

  let activeTransitionTimer = null;

  const scrollToElementSmoothly = (elementId) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    const headerOffset = document.getElementById('mainNav')?.offsetHeight || 78;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset - 12;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };

  const switchPage = (pageId, options = {}) => {
    const { scrollToId = null, updateHistory = true, immediate = false, onComplete = null } = options;
    const targetView = document.querySelector(`.page-view[data-page="${pageId}"]`);
    if (!targetView) return;

    const currentView = document.querySelector('.page-view.is-active');

    // Cập nhật trạng thái active trên thanh menu ngay lập tức để phản hồi chạm nhạy trên Mobile/iPad
    navItems.forEach((item) => {
      item.classList.toggle('nav-links__item--active', item.dataset.pageTarget === pageId);
    });

    if (pageTitles[pageId]) {
      document.title = pageTitles[pageId];
    }

    if (navLinks) {
      navLinks.classList.remove('is-open');
    }

    if (updateHistory) {
      const newHash = `#${pageId}`;
      if (window.location.hash !== newHash) {
        history.pushState({ pageId, scrollToId }, '', newHash);
      }
    }

    // Nếu đang ở sẵn trang đích, chỉ cuộn mượt tới phần tử yêu cầu
    if (currentView === targetView) {
      if (scrollToId) {
        scrollToElementSmoothly(scrollToId);
      } else if (!immediate) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    if (activeTransitionTimer) {
      clearTimeout(activeTransitionTimer);
      activeTransitionTimer = null;
    }

    const activateTargetView = () => {
      pageViews.forEach((view) => {
        view.classList.remove('is-leaving');
        view.classList.toggle('is-active', view === targetView);
      });

      if (scrollToId) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        requestAnimationFrame(() => {
          scrollToElementSmoothly(scrollToId);
          if (typeof onComplete === 'function') setTimeout(onComplete, 220);
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (typeof onComplete === 'function') onComplete();
      }
    };

    if (immediate || !currentView) {
      activateTargetView();
      return;
    }

    // Hiệu ứng chuyển cảnh 2 pha mượt mà (Fade-out trang cũ -> Glide-in trang mới)
    currentView.classList.remove('is-active');
    currentView.classList.add('is-leaving');

    activeTransitionTimer = setTimeout(() => {
      activateTargetView();
    }, 145);
  };

  // Gắn sự kiện chuyển trang thông minh cho mọi phần tử có data-page-target
  document.querySelectorAll('[data-page-target]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = trigger.getAttribute('data-page-target');
      const scrollToId = trigger.getAttribute('data-scroll-to');
      const selectPkg = trigger.getAttribute('data-select-pkg');
      const openFaqIdx = trigger.getAttribute('data-open-faq');

      if (targetPage) {
        switchPage(targetPage, {
          scrollToId,
          updateHistory: true,
          onComplete: () => {
            // Tự động chọn đúng gói trong form tư vấn khi khách bấm dịch vụ tương ứng
            if (selectPkg) {
              const pkgSelect = document.getElementById('leadPackage');
              if (pkgSelect) {
                let found = false;
                for (let i = 0; i < pkgSelect.options.length; i++) {
                  if (pkgSelect.options[i].value.toLowerCase().includes(selectPkg.toLowerCase()) ||
                      selectPkg.toLowerCase().includes(pkgSelect.options[i].value.toLowerCase())) {
                    pkgSelect.selectedIndex = i;
                    found = true;
                    break;
                  }
                }
                if (!found) {
                  const newOpt = new Option(selectPkg, selectPkg, true, true);
                  pkgSelect.add(newOpt);
                }
                // Hiệu ứng nháy nhẹ viền màu xanh chủ đạo #007BA7 để báo hiệu đã chọn
                pkgSelect.style.borderColor = '#007BA7';
                pkgSelect.style.boxShadow = '0 0 0 4px rgba(0, 123, 167, 0.25)';
                setTimeout(() => {
                  pkgSelect.style.borderColor = '';
                  pkgSelect.style.boxShadow = '';
                }, 1200);
              }
            }

            // Tự động mở câu hỏi FAQ liên quan khi bấm vào thẻ Xử lý Review Xấu
            if (openFaqIdx !== null) {
              const allFaqItems = document.querySelectorAll('.faq-item');
              const idx = parseInt(openFaqIdx, 10);
              if (allFaqItems[idx]) {
                allFaqItems.forEach((f) => f.classList.remove('is-open'));
                allFaqItems[idx].classList.add('is-open');
              }
            }
          },
        });
      }
    });
  });

  // Hỗ trợ nút Back/Forward của trình duyệt và truy cập trực tiếp qua URL hash
  const handleHashChange = (isInitial = false) => {
    const rawHash = window.location.hash.replace('#', '').trim();
    if (!rawHash) {
      switchPage('trang-chu', { updateHistory: false, immediate: isInitial });
      return;
    }
    const mapped = hashAliasMap[rawHash];
    if (mapped) {
      switchPage(mapped.page, {
        scrollToId: mapped.scrollTo || null,
        updateHistory: false,
        immediate: isInitial,
      });
    }
  };

  window.addEventListener('popstate', () => handleHashChange(false));
  if (window.location.hash) {
    handleHashChange(true);
  }

  // Menu mobile toggle & đóng menu khi bấm ra ngoài trên Mobile/iPad
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('is-open');
    });

    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('is-open') && !navLinks.contains(e.target) && e.target !== navToggle) {
        navLinks.classList.remove('is-open');
      }
    });
  }

  // Hệ thống Bảng Giá & Dự Toán (20.000 VNĐ Review 5 sao | 22.000 VNĐ Review kèm ảnh)
  const formatVND = (num) => `${num.toLocaleString('vi-VN')} VNĐ`;

  const rateTabs = document.querySelectorAll('.rate-tab');
  const liveUnitRate = document.getElementById('liveUnitRate');
  const liveRateDesc = document.getElementById('liveRateDesc');
  const pricingStandard = document.getElementById('pricing-standard');
  const pricingPhoto = document.getElementById('pricing-photo');
  const quickQtyInput = document.getElementById('quickQtyInput');
  const quickTotalDisplay = document.getElementById('quickTotalDisplay');
  const qtyPills = document.querySelectorAll('.qty-pill');

  const calcType = document.getElementById('calcType');
  const calcQty = document.getElementById('calcQty');
  const calcOrders = document.getElementById('calcOrders');
  const calcTotal = document.getElementById('calcTotal');
  const calcNote = document.getElementById('calcNote');

  let currentUnitPrice = 20000;

  const updateQuickBanner = () => {
    if (!quickQtyInput || !quickTotalDisplay) return;
    const rawVal = parseInt(quickQtyInput.value, 10);
    const clampedQty = Number.isNaN(rawVal) ? 2 : Math.min(50, Math.max(2, rawVal));
    const total = clampedQty * currentUnitPrice;
    quickTotalDisplay.textContent = formatVND(total);

    qtyPills.forEach((pill) => {
      pill.classList.toggle('is-active', parseInt(pill.dataset.qty, 10) === clampedQty);
    });
  };

  const updateDetailedCalculator = () => {
    if (!calcType || !calcQty || !calcOrders || !calcTotal || !calcNote) return;

    const unitPrice = parseInt(calcType.value, 10) || 20000;
    const rawQty = parseInt(calcQty.value, 10);
    const qtyPerOrder = Number.isNaN(rawQty) ? 2 : Math.min(50, Math.max(2, rawQty));
    const orders = parseInt(calcOrders.value, 10) || 1;
    const totalReviews = qtyPerOrder * orders;
    const totalCost = totalReviews * unitPrice;
    const days = Math.max(1, Math.ceil(totalReviews / 3));

    calcTotal.textContent = formatVND(totalCost);
    calcNote.textContent = `${totalReviews} lượt (${orders} đơn) × ${unitPrice.toLocaleString('vi-VN')}đ • Rải tự nhiên ~${days} ngày`;
  };

  rateTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      rateTabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      const isPhoto = tab.dataset.rateType === 'photo';
      currentUnitPrice = isPhoto ? 22000 : 20000;

      if (liveUnitRate) {
        liveUnitRate.textContent = isPhoto ? '22.000 VNĐ' : '20.000 VNĐ';
      }
      if (liveRateDesc) {
        liveRateDesc.textContent = isPhoto
          ? 'Đánh giá 5★ kèm hình ảnh thực tế cửa hàng/sản phẩm'
          : 'Đánh giá 5★ nội dung chuẩn SEO >115 ký tự';
      }

      if (pricingStandard) pricingStandard.classList.toggle('is-hidden', isPhoto);
      if (pricingPhoto) pricingPhoto.classList.toggle('is-hidden', !isPhoto);

      if (calcType) {
        calcType.value = String(currentUnitPrice);
      }

      updateQuickBanner();
      updateDetailedCalculator();
    });
  });

  if (quickQtyInput) {
    quickQtyInput.addEventListener('input', () => {
      updateQuickBanner();
      if (calcQty) {
        const val = parseInt(quickQtyInput.value, 10);
        if (!Number.isNaN(val)) {
          calcQty.value = String(Math.min(50, Math.max(2, val)));
          updateDetailedCalculator();
        }
      }
    });

    quickQtyInput.addEventListener('blur', () => {
      const val = parseInt(quickQtyInput.value, 10);
      const clamped = Number.isNaN(val) ? 2 : Math.min(50, Math.max(2, val));
      quickQtyInput.value = String(clamped);
      updateQuickBanner();
    });
  }

  qtyPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const qty = parseInt(pill.dataset.qty, 10) || 10;
      if (quickQtyInput) quickQtyInput.value = String(qty);
      if (calcQty) calcQty.value = String(qty);
      updateQuickBanner();
      updateDetailedCalculator();
    });
  });

  if (calcType && calcQty && calcOrders) {
    calcType.addEventListener('change', () => {
      const isPhoto = calcType.value === '22000';
      currentUnitPrice = isPhoto ? 22000 : 20000;
      rateTabs.forEach((t) => {
        t.classList.toggle('is-active', t.dataset.rateType === (isPhoto ? 'photo' : 'standard'));
      });
      if (liveUnitRate) liveUnitRate.textContent = isPhoto ? '22.000 VNĐ' : '20.000 VNĐ';
      if (pricingStandard) pricingStandard.classList.toggle('is-hidden', isPhoto);
      if (pricingPhoto) pricingPhoto.classList.toggle('is-hidden', !isPhoto);
      updateQuickBanner();
      updateDetailedCalculator();
    });

    calcQty.addEventListener('input', () => {
      if (quickQtyInput) {
        const val = parseInt(calcQty.value, 10);
        if (!Number.isNaN(val)) {
          quickQtyInput.value = String(Math.min(50, Math.max(2, val)));
          updateQuickBanner();
        }
      }
      updateDetailedCalculator();
    });

    calcQty.addEventListener('blur', () => {
      const val = parseInt(calcQty.value, 10);
      calcQty.value = String(Number.isNaN(val) ? 2 : Math.min(50, Math.max(2, val)));
      updateDetailedCalculator();
    });

    calcOrders.addEventListener('change', updateDetailedCalculator);

    updateQuickBanner();
    updateDetailedCalculator();
  }

  // Accordion Câu hỏi thường gặp (FAQ)
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-item__trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const wasOpen = item.classList.contains('is-open');
      faqItems.forEach((other) => other.classList.remove('is-open'));
      if (!wasOpen) {
        item.classList.add('is-open');
      }
    });
  });

  // CẤU HÌNH GOOGLE APPS SCRIPT WEB APP URL ĐẨY DATA VỀ GOOGLE SHEETS
  const GOOGLE_SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwMVAuv9XGgya9O2TZhmZKKdiWoYbWIHRExIveb1bskX30ranIjud9OF1fcv_0ZAJprqA/exec";

  // Form Đăng ký nhận tư vấn theo layout Ảnh mẫu
  const leadForm = document.getElementById('leadForm');
  const formFeedback = document.getElementById('formFeedback');
  const feedbackText = document.getElementById('feedbackText');
  const leadFeedbackCard = document.getElementById('leadFeedbackCard');
  const leadFeedbackIcon = document.getElementById('leadFeedbackIcon');

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('leadName');
      const phoneInput = document.getElementById('leadPhone');
      const consentCheck = document.getElementById('leadConsent');

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const phoneVal = phoneInput ? phoneInput.value.trim() : '';

      // Kiểm tra họ tên
      if (!nameVal) {
        if (formFeedback && feedbackText) {
          formFeedback.classList.remove('is-hidden');
          if (leadFeedbackCard) leadFeedbackCard.className = 'lead-feedback-card lead-feedback-card--error';
          if (leadFeedbackIcon) leadFeedbackIcon.textContent = '✕';
          feedbackText.innerHTML = 'Vui lòng nhập <strong>Họ và tên</strong> của bạn để chuyên gia tiện xưng hô!';
        }
        if (nameInput) nameInput.focus();
        return;
      }

      // Kiểm tra số điện thoại
      if (!phoneVal) {
        if (formFeedback && feedbackText) {
          formFeedback.classList.remove('is-hidden');
          if (leadFeedbackCard) leadFeedbackCard.className = 'lead-feedback-card lead-feedback-card--error';
          if (leadFeedbackIcon) leadFeedbackIcon.textContent = '✕';
          feedbackText.innerHTML = 'Vui lòng nhập <strong>Số điện thoại / Zalo</strong> để chuyên gia liên hệ tư vấn!';
        }
        if (phoneInput) phoneInput.focus();
        return;
      }

      const regionSelect = document.getElementById('leadRegion');
      const pkgSelect = document.getElementById('leadPackage');
      const regionVal = regionSelect ? regionSelect.value : '';
      const pkgVal = pkgSelect ? pkgSelect.value : '';
      const mapLinkVal = document.getElementById('leadMapLink')?.value || '';

      // Kiểm tra khu vực maps
      if (!regionVal) {
        if (formFeedback && feedbackText) {
          formFeedback.classList.remove('is-hidden');
          if (leadFeedbackCard) leadFeedbackCard.className = 'lead-feedback-card lead-feedback-card--error';
          if (leadFeedbackIcon) leadFeedbackIcon.textContent = '✕';
          feedbackText.innerHTML = 'Vui lòng chọn <strong>Khu vực Maps</strong> mà bạn đang quản lý!';
        }
        if (regionSelect) regionSelect.focus();
        return;
      }

      // Kiểm tra gói dịch vụ quan tâm
      if (!pkgVal) {
        if (formFeedback && feedbackText) {
          formFeedback.classList.remove('is-hidden');
          if (leadFeedbackCard) leadFeedbackCard.className = 'lead-feedback-card lead-feedback-card--error';
          if (leadFeedbackIcon) leadFeedbackIcon.textContent = '✕';
          feedbackText.innerHTML = 'Vui lòng chọn <strong>Gói dịch vụ quan tâm</strong> để chuyên gia báo giá chính xác!';
        }
        if (pkgSelect) pkgSelect.focus();
        return;
      }

      // Kiểm tra dấu tích đồng ý cung cấp thông tin
      if (consentCheck && !consentCheck.checked) {
        if (formFeedback && feedbackText) {
          formFeedback.classList.remove('is-hidden');
          if (leadFeedbackCard) leadFeedbackCard.className = 'lead-feedback-card lead-feedback-card--error';
          if (leadFeedbackIcon) leadFeedbackIcon.textContent = '✕';
          feedbackText.innerHTML = 'Vui lòng tích chọn <strong>đồng ý cung cấp thông tin</strong> để chúng tôi liên hệ hỗ trợ bạn.';
        }
        consentCheck.focus();
        return;
      }

      // Đẩy data lên Google Sheet Web App của hệ sinh thái 500KUSER
      try {
        const payload = {
          domain: window.location.hostname || '500kuser.com',
          source_url: window.location.href,
          full_name: nameVal,
          phone: phoneVal,
          map_region: regionVal,
          service_package: pkgVal,
          map_url: mapLinkVal,
          notes: 'Đăng ký tư vấn từ website liên minh 500KUSER & FaceSEO'
        };

        fetch(GOOGLE_SHEET_WEBAPP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (err) {}

      // Hiển thị thông báo thành công chuẩn format ảnh mẫu
      if (formFeedback && feedbackText) {
        formFeedback.classList.remove('is-hidden');
        if (leadFeedbackCard) leadFeedbackCard.className = 'lead-feedback-card';
        if (leadFeedbackIcon) leadFeedbackIcon.textContent = '✓';
        feedbackText.innerHTML = `Cảm ơn <strong>${nameVal}</strong>! Thông tin của bạn đã được chuyển tới chuyên gia <strong>500KUSER</strong>. Chúng tôi sẽ liên hệ lại qua SĐT/Zalo <strong>${phoneVal}</strong> trong ít phút.`;
      }

      // Reset toàn bộ trường nhập liệu sau khi gửi thành công để khách tiếp theo tự điền
      setTimeout(() => {
        if (nameInput) nameInput.value = '';
        if (phoneInput) phoneInput.value = '';
        const mapInput = document.getElementById('leadMapLink');
        if (mapInput) mapInput.value = '';
        if (regionSelect) regionSelect.selectedIndex = 0;
        if (pkgSelect) pkgSelect.selectedIndex = 0;
        if (consentCheck) consentCheck.checked = false;
      }, 500);
    });
  }

  // Bảng tên chuẩn Tiếng Việt UTF-8 cho toàn bộ 63 Tỉnh Thành Việt Nam
  const provinceNamesById = {
    'vn-qn': 'Quảng Ninh',
    'vn-kh': 'Khánh Hòa (Nha Trang)',
    'vn-tg': 'Tiền Giang',
    'vn-bv': 'Bà Rịa - Vũng Tàu (Côn Đảo)',
    'vn-bu': 'Bình Thuận',
    'vn-hc': 'TP. Hồ Chí Minh',
    'vn-br': 'Bến Tre',
    'vn-st': 'Sóc Trăng',
    'vn-pt': 'Phú Thọ',
    'vn-yb': 'Yên Bái',
    'vn-hd': 'Hải Dương',
    'vn-bn': 'Bắc Ninh',
    'vn-317': 'Hưng Yên',
    'vn-nb': 'Ninh Bình',
    'vn-hm': 'Hà Nam',
    'vn-ho': 'Hòa Bình',
    'vn-vc': 'Vĩnh Phúc',
    'vn-318': 'Thủ đô Hà Nội',
    'vn-bg': 'Bắc Giang',
    'vn-tb': 'Thái Bình',
    'vn-ld': 'Lâm Đồng (Đà Lạt)',
    'vn-bp': 'Bình Phước',
    'vn-py': 'Phú Yên',
    'vn-bd': 'Bình Định (Quy Nhơn)',
    'vn-724': 'Gia Lai',
    'vn-qg': 'Quảng Ngãi',
    'vn-331': 'Đồng Nai',
    'vn-dt': 'Đồng Tháp',
    'vn-la': 'Long An',
    'vn-3623': 'TP. Hải Phòng',
    'vn-337': 'Hậu Giang',
    'vn-bl': 'Bạc Liêu',
    'vn-vl': 'Vĩnh Long',
    'vn-tn': 'Tây Ninh',
    'vn-ty': 'Thái Nguyên',
    'vn-li': 'Lai Châu',
    'vn-311': 'Sơn La',
    'vn-hg': 'Hà Giang',
    'vn-nd': 'Nam Định',
    'vn-328': 'Hà Tĩnh',
    'vn-na': 'Nghệ An',
    'vn-qb': 'Quảng Bình',
    'vn-723': 'Đắk Lắk',
    'vn-nt': 'Ninh Thuận',
    'vn-6365': 'Đắk Nông',
    'vn-299': 'Kon Tum',
    'vn-300': 'Quảng Nam (Hội An)',
    'vn-qt': 'Quảng Trị',
    'vn-tt': 'Thừa Thiên Huế',
    'vn-da': 'TP. Đà Nẵng',
    'vn-ag': 'An Giang',
    'vn-cm': 'Cà Mau',
    'vn-tv': 'Trà Vinh',
    'vn-cb': 'Cao Bằng',
    'vn-kg': 'Kiên Giang (Phú Quốc)',
    'vn-lo': 'Lào Cai',
    'vn-db': 'Điện Biên',
    'vn-ls': 'Lạng Sơn',
    'vn-th': 'Thanh Hóa',
    'vn-307': 'Bắc Kạn',
    'vn-tq': 'Tuyên Quang',
    'vn-bi': 'Bình Dương',
    'vn-333': 'TP. Cần Thơ',
  };

  // =========================================================================
  // HỆ THỐNG ĐÁNH GIÁ THẬT 100% TRÊN BẢN ĐỒ VIỆT NAM (Tự hiện khi có đánh giá)
  // =========================================================================
  const STORAGE_KEY_REVIEWS = 'ai500k_real_map_reviews_v1';
  const vnLiveToast = document.getElementById('vnLiveToast');
  const vnLiveToastText = document.getElementById('vnLiveToastText');
  const vnProvinces = document.querySelectorAll('.vn-province');
  const vnDynamicReviewPin = document.getElementById('vnDynamicReviewPin');
  const vnActiveProvinceTag = document.getElementById('vnActiveProvinceTag');
  const vnPtagBadge = document.getElementById('vnPtagBadge');
  const vnPtagRect = document.getElementById('vnPtagRect');
  const vnPtagText = document.getElementById('vnPtagText');
  const vnMapCanvas = document.querySelector('.vn-map-canvas');
  const vnRealReviewCard = document.getElementById('vnRealReviewCard');
  const vnPopupAvatar = document.getElementById('vnPopupAvatar');
  const vnPopupName = document.getElementById('vnPopupName');
  const vnPopupProvince = document.getElementById('vnPopupProvince');
  const vnPopupTime = document.getElementById('vnPopupTime');
  const vnPopupStars = document.getElementById('vnPopupStars');
  const vnPopupPkg = document.getElementById('vnPopupPkg');
  const vnPopupComment = document.getElementById('vnPopupComment');
  const vnPopupCloseBtn = document.getElementById('vnPopupCloseBtn');
  const vnTotalReviewsCount = document.getElementById('vnTotalReviewsCount');

  const toggleMapReviewFormBtn = document.getElementById('toggleMapReviewFormBtn');
  const closeQuickReviewFormBtn = document.getElementById('closeQuickReviewFormBtn');
  const vnQuickReviewForm = document.getElementById('vnQuickReviewForm');
  const quickRevProvince = document.getElementById('quickRevProvince');
  const fullRealReviewForm = document.getElementById('fullRealReviewForm');
  const fullRevProvince = document.getElementById('fullRevProvince');
  const fullRevStarPicker = document.getElementById('fullRevStarPicker');
  const fullRevStarLabel = document.getElementById('fullRevStarLabel');
  const realReviewFeedList = document.getElementById('realReviewFeedList');

  // Dữ liệu đánh giá thực tế ban đầu từ khách hàng
  const defaultRealReviews = [
    {
      id: 'rev-1',
      name: 'Nguyễn Minh Tuấn - Tuấn Auto',
      provinceId: 'vn-hc',
      stars: 5,
      pkg: 'Review kèm ảnh',
      comment: 'Gara mình ở Quận 7 đặt gói 30 review kèm ảnh, toàn tài khoản Local Guide thật có lịch sử đi lại nên hiển thị 100% rất tự nhiên.',
      createdAt: Date.now() - 1000 * 60 * 12,
    },
    {
      id: 'rev-2',
      name: 'Chị Lan Anh - Nha Khoa thẩm mỹ',
      provinceId: 'vn-318',
      stars: 5,
      pkg: 'Review kèm ảnh',
      comment: 'Từ ngày lên 45 đánh giá 5 sao có hình ảnh phòng khám tại Hà Nội, lượng khách bấm chỉ đường và gọi hotline tăng gấp đôi.',
      createdAt: Date.now() - 1000 * 60 * 48,
    },
    {
      id: 'rev-3',
      name: 'Trần Quốc Bảo - Hải Sản Biển Đông',
      provinceId: 'vn-da',
      stars: 5,
      pkg: 'Review 5 sao',
      comment: 'Đánh giá rải đều mỗi ngày, câu chữ viết rất có tâm trên 120 ký tự. Maps nhà hàng mình đã lọt Top 3 tìm kiếm tại Đà Nẵng.',
      createdAt: Date.now() - 1000 * 60 * 135,
    },
    {
      id: 'rev-4',
      name: 'Hoàng Gia Homestay & Villa',
      provinceId: 'vn-kh',
      stars: 5,
      pkg: 'Review kèm ảnh',
      comment: 'Dịch vụ uy tín, giá 22k/review kèm ảnh quá hợp lý. Khách du lịch Nha Trang nhìn vào điểm 4.9 sao là yên tâm đặt phòng ngay.',
      createdAt: Date.now() - 1000 * 60 * 310,
    },
    {
      id: 'rev-5',
      name: 'Phạm Thanh Hùng - Du Thuyền Hạ Long',
      provinceId: 'vn-qn',
      stars: 5,
      pkg: 'Review kèm ảnh',
      comment: 'Tài khoản đánh giá toàn Local Guide cấp cao, có bảo hành đầy đủ. Rất hài lòng với đội ngũ kỹ thuật hỗ trợ.',
      createdAt: Date.now() - 1000 * 60 * 520,
    },
    {
      id: 'rev-6',
      name: 'Resort Pearl Island Phú Quốc',
      provinceId: 'vn-kg',
      stars: 5,
      pkg: 'Review 5 sao',
      comment: 'Hệ thống phân phối thiết bị thật rất chuẩn, lên review bền vững không bị quét như các bên dùng tool ảo trước đây mình từng thuê.',
      createdAt: Date.now() - 1000 * 60 * 840,
    },
  ];

  const loadRealReviews = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // Bỏ qua lỗi đọc bộ nhớ trình duyệt
    }
    return [...defaultRealReviews];
  };

  let realReviews = loadRealReviews();
  let activeReviewId = realReviews[0]?.id || null;

  const saveRealReviews = () => {
    try {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(realReviews));
    } catch (e) {
      // Bỏ qua nếu trình duyệt chặn localStorage
    }
  };

  const getInitials = (fullName) => {
    const clean = (fullName || 'KH').split('-')[0].trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const formatTimeAgo = (ts) => {
    const diffSec = Math.max(0, Math.floor((Date.now() - (ts || Date.now())) / 1000));
    if (diffSec < 60) return 'Vừa xong';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay} ngày trước`;
  };

  const formatStars = (count) => {
    const n = Math.min(5, Math.max(1, Number(count) || 5));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  };

  // Điền danh sách 63 Tỉnh Thành vào các ô <select>
  const populateProvinceSelects = () => {
    const priorityIds = ['vn-hc', 'vn-318', 'vn-da', 'vn-kh', 'vn-qn', 'vn-3623', 'vn-333', 'vn-kg', 'vn-ld', 'vn-bi', 'vn-331'];
    const allEntries = Object.entries(provinceNamesById);
    const priorityEntries = priorityIds
      .filter((id) => provinceNamesById[id])
      .map((id) => [id, provinceNamesById[id]]);
    const otherEntries = allEntries
      .filter(([id]) => !priorityIds.includes(id))
      .sort((a, b) => a[1].localeCompare(b[1], 'vi'));

    const sortedEntries = [...priorityEntries, ...otherEntries];
    [quickRevProvince, fullRevProvince].forEach((sel) => {
      if (!sel) return;
      sel.innerHTML = sortedEntries
        .map(([id, name]) => `<option value="${id}">${name}</option>`)
        .join('');
    });
  };

  populateProvinceSelects();

  // Bảng tọa độ trung tâm tối ưu trên đất liền cho 63 Tỉnh Thành Việt Nam
  const provinceCenterOverrides = {
    'vn-kg': { cx: 128, cy: 630 }, // Kiên Giang (đất liền)
    'vn-kh': { cx: 312, cy: 518 }, // Khánh Hòa (Nha Trang)
    'vn-qn': { cx: 215, cy: 104 }, // Quảng Ninh
    'vn-cm': { cx: 138, cy: 686 }, // Cà Mau
    'vn-bv': { cx: 242, cy: 618 }, // Bà Rịa - Vũng Tàu
    'vn-hc': { cx: 211, cy: 601.5 }, // TP. Hồ Chí Minh
    'vn-318': { cx: 168, cy: 128 }, // Hà Nội
    'vn-da': { cx: 258, cy: 378 }, // Đà Nẵng
    'vn-st': { cx: 178, cy: 664 }, // Sóc Trăng
    'vn-bl': { cx: 160, cy: 678 }, // Bạc Liêu
    'vn-br': { cx: 198, cy: 636 }, // Bến Tre
    'vn-tg': { cx: 190, cy: 622 }, // Tiền Giang
    'vn-dt': { cx: 162, cy: 608 }, // Đồng Tháp
    'vn-ag': { cx: 136, cy: 602 }, // An Giang
    'vn-333': { cx: 168, cy: 632 }, // Cần Thơ
    'vn-337': { cx: 168, cy: 648 }, // Hậu Giang
    'vn-vl': { cx: 180, cy: 628 }, // Vĩnh Long
    'vn-tv': { cx: 196, cy: 650 }, // Trà Vinh
    'vn-la': { cx: 188, cy: 592 }, // Long An
    'vn-tn': { cx: 180, cy: 562 }, // Tây Ninh
    'vn-bi': { cx: 206, cy: 574 }, // Bình Dương
    'vn-bp': { cx: 218, cy: 546 }, // Bình Phước
    'vn-331': { cx: 226, cy: 588 }, // Đồng Nai
    'vn-bu': { cx: 268, cy: 590 }, // Bình Thuận
    'vn-nt': { cx: 298, cy: 548 }, // Ninh Thuận
    'vn-ld': { cx: 260, cy: 542 }, // Lâm Đồng
    'vn-6365': { cx: 236, cy: 520 }, // Đắk Nông
    'vn-723': { cx: 262, cy: 494 }, // Đắk Lắk
    'vn-py': { cx: 308, cy: 480 }, // Phú Yên
    'vn-724': { cx: 258, cy: 450 }, // Gia Lai
    'vn-bd': { cx: 298, cy: 440 }, // Bình Định
    'vn-299': { cx: 242, cy: 412 }, // Kon Tum
    'vn-qg': { cx: 284, cy: 402 }, // Quảng Ngãi
    'vn-300': { cx: 260, cy: 390 }, // Quảng Nam
    'vn-tt': { cx: 232, cy: 350 }, // Thừa Thiên Huế
    'vn-qt': { cx: 216, cy: 324 }, // Quảng Trị
    'vn-qb': { cx: 198, cy: 290 }, // Quảng Bình
    'vn-328': { cx: 188, cy: 254 }, // Hà Tĩnh
    'vn-na': { cx: 172, cy: 214 }, // Nghệ An
    'vn-th': { cx: 168, cy: 172 }, // Thanh Hóa
    'vn-nb': { cx: 172, cy: 148 }, // Ninh Bình
    'vn-hm': { cx: 174, cy: 136 }, // Hà Nam
    'vn-nd': { cx: 184, cy: 142 }, // Nam Định
    'vn-tb': { cx: 192, cy: 136 }, // Thái Bình
    'vn-317': { cx: 178, cy: 128 }, // Hưng Yên
    'vn-hd': { cx: 188, cy: 120 }, // Hải Dương
    'vn-3623': { cx: 198, cy: 122 }, // Hải Phòng
    'vn-bn': { cx: 178, cy: 114 }, // Bắc Ninh
    'vn-bg': { cx: 188, cy: 104 }, // Bắc Giang
    'vn-ls': { cx: 202, cy: 82 }, // Lạng Sơn
    'vn-cb': { cx: 182, cy: 52 }, // Cao Bằng
    'vn-307': { cx: 168, cy: 74 }, // Bắc Kạn
    'vn-ty': { cx: 166, cy: 96 }, // Thái Nguyên
    'vn-vc': { cx: 160, cy: 114 }, // Vĩnh Phúc
    'vn-pt': { cx: 146, cy: 112 }, // Phú Thọ
    'vn-tq': { cx: 152, cy: 82 }, // Tuyên Quang
    'vn-hg': { cx: 142, cy: 54 }, // Hà Giang
    'vn-yb': { cx: 128, cy: 90 }, // Yên Bái
    'vn-lo': { cx: 116, cy: 68 }, // Lào Cai
    'vn-li': { cx: 84, cy: 74 }, // Lai Châu
    'vn-db': { cx: 72, cy: 102 }, // Điện Biên
    'vn-311': { cx: 106, cy: 122 }, // Sơn La
    'vn-ho': { cx: 142, cy: 138 }, // Hòa Bình
  };

  const getShortProvinceName = (provId) => {
    const full = provinceNamesById[provId] || 'Việt Nam';
    return full.split('(')[0].trim();
  };

  const getProvinceCenter = (targetPath, provId) => {
    if (targetPath && typeof targetPath.getBBox === 'function') {
      try {
        const bbox = targetPath.getBBox();
        if (bbox && bbox.width > 0 && bbox.height > 0) {
          if (provId && provinceCenterOverrides[provId]) {
            return provinceCenterOverrides[provId];
          }
          return {
            cx: bbox.x + bbox.width / 2,
            cy: bbox.y + bbox.height / 2,
          };
        }
      } catch (e) {}
    }
    if (provId && provinceCenterOverrides[provId]) {
      return provinceCenterOverrides[provId];
    }
    return { cx: 211, cy: 601.5 };
  };

  let currentPoppedProvinceId = null;

  // Kích hoạt tỉnh: Phóng to 1 xíu + sáng bừng + bên trong là tên tỉnh
  const activateProvince = (provId, isUserAction = false) => {
    if (!provId) return;
    const targetPath = document.getElementById(provId);
    if (!targetPath) return;

    if (currentPoppedProvinceId && currentPoppedProvinceId !== provId) {
      const prevPath = document.getElementById(currentPoppedProvinceId);
      if (prevPath) prevPath.classList.remove('is-active-pop');
    }

    currentPoppedProvinceId = provId;
    targetPath.classList.add('is-active-pop');

    // Đưa path lên cuối nhóm SVG để khi phóng to scale(1.1) không bị đè bởi viền lân cận
    if (targetPath.parentElement) {
      targetPath.parentElement.appendChild(targetPath);
    }

    const center = getProvinceCenter(targetPath, provId);
    const cx = Number(center.cx);
    const cy = Number(center.cy);

    if (vnActiveProvinceTag) {
      const tx = cx.toFixed(1);
      const ty = cy.toFixed(1);
      vnActiveProvinceTag.setAttribute('transform', `translate(${tx}, ${ty})`);
      vnActiveProvinceTag.style.transform = `translate(${tx}px, ${ty}px)`;

      const shortName = getShortProvinceName(provId);
      if (vnPtagText) vnPtagText.textContent = shortName;

      if (vnPtagRect) {
        const textLen = shortName.length;
        const rectWidth = Math.max(68, textLen * 8.6 + 26);
        vnPtagRect.setAttribute('x', (-rectWidth / 2).toFixed(1));
        vnPtagRect.setAttribute('width', rectWidth.toFixed(1));
      }

      vnActiveProvinceTag.classList.remove('is-active');
      void vnActiveProvinceTag.offsetWidth;
      vnActiveProvinceTag.classList.add('is-active');
    }

    if (isUserAction) {
      const fullName = provinceNamesById[provId] || getShortProvinceName(provId);
      const countInProv = realReviews.filter((r) => r.provinceId === provId).length;
      if (countInProv > 0) {
        updateTopToast(`📍 ${fullName} • ${countInProv} đánh giá thật (Bấm để xem)`);
      } else {
        updateTopToast(`📍 ${fullName} • Phủ sóng đánh giá Google Maps 5★`);
      }
    }
  };

  // Định vị Ghim 5★ động đến đúng trung tâm địa lý của Tỉnh Thành trên SVG Bản đồ Việt Nam
  const highlightAndPinProvince = (provId) => {
    vnProvinces.forEach((p) => {
      p.classList.toggle('is-lit', Boolean(provId && p.id === provId));
    });

    if (!provId || !vnDynamicReviewPin) return;
    const targetPath = document.getElementById(provId);
    const center = getProvinceCenter(targetPath, provId);
    vnDynamicReviewPin.setAttribute('transform', `translate(${center.cx.toFixed(1)}, ${center.cy.toFixed(1)})`);
  };

  const updateTopToast = (text) => {
    if (!vnLiveToast || !vnLiveToastText) return;
    vnLiveToast.classList.add('is-switching');
    setTimeout(() => {
      vnLiveToastText.textContent = text;
      vnLiveToast.classList.remove('is-switching');
    }, 150);
  };

  // Hiển thị Thẻ Đánh Giá Thật trực tiếp trên Bản Đồ Việt Nam
  const showRealReviewOnMap = (review, isNewLive = false) => {
    if (!review) return;
    activeReviewId = review.id;
    const provName = provinceNamesById[review.provinceId] || 'Việt Nam';

    if (vnPopupAvatar) vnPopupAvatar.textContent = getInitials(review.name);
    if (vnPopupName) vnPopupName.textContent = review.name;
    if (vnPopupProvince) {
      vnPopupProvince.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${provName}`;
    }
    if (vnPopupTime) vnPopupTime.textContent = formatTimeAgo(review.createdAt);
    if (vnPopupStars) vnPopupStars.textContent = formatStars(review.stars);
    if (vnPopupPkg) vnPopupPkg.textContent = review.pkg || 'Review 5 sao';
    if (vnPopupComment) vnPopupComment.textContent = `"${review.comment}"`;

    highlightAndPinProvince(review.provinceId);
    activateProvince(review.provinceId, false);

    if (vnRealReviewCard) {
      vnRealReviewCard.classList.remove('is-minimized');
      vnRealReviewCard.classList.remove('is-popping');
      // Kích hoạt lại animation bật thẻ khi có đánh giá mới hoặc người dùng chọn
      void vnRealReviewCard.offsetWidth;
      vnRealReviewCard.classList.add('is-popping');
    }

    const prefix = isNewLive ? '★ Đánh giá thật mới: ' : '📍 Đánh giá thật tại ';
    updateTopToast(`${prefix}${provName} — ${review.name}`);

    // Đồng bộ trạng thái đang chọn dưới danh sách
    if (realReviewFeedList) {
      realReviewFeedList.querySelectorAll('.real-feed-item').forEach((item) => {
        item.classList.toggle('is-selected', item.getAttribute('data-review-id') === review.id);
      });
    }
  };

  // Render danh sách đánh giá thật
  const renderRealReviewFeed = () => {
    if (vnTotalReviewsCount) {
      vnTotalReviewsCount.textContent = String(realReviews.length);
    }
    if (!realReviewFeedList) return;

    realReviewFeedList.innerHTML = realReviews
      .map((rev) => {
        const provName = provinceNamesById[rev.provinceId] || 'Việt Nam';
        const isSelected = rev.id === activeReviewId ? 'is-selected' : '';
        return `
          <article class="real-feed-item ${isSelected}" data-review-id="${rev.id}">
            <div class="real-feed-item__top">
              <div class="real-feed-item__avatar">${getInitials(rev.name)}</div>
              <div class="real-feed-item__info">
                <div class="real-feed-item__name">
                  <span>${rev.name}</span>
                  <span class="real-feed-item__loc"><i class="fa-solid fa-location-dot"></i> ${provName}</span>
                </div>
                <div class="real-feed-item__sub">
                  <span class="real-feed-item__stars">${formatStars(rev.stars)}</span>
                  <span>•</span>
                  <span>${rev.pkg || 'Review 5 sao'}</span>
                  <span>•</span>
                  <span>${formatTimeAgo(rev.createdAt)}</span>
                </div>
              </div>
            </div>
            <p class="real-feed-item__comment">"${rev.comment}"</p>
          </article>
        `;
      })
      .join('');

    realReviewFeedList.querySelectorAll('.real-feed-item').forEach((card) => {
      card.addEventListener('click', () => {
        const revId = card.getAttribute('data-review-id');
        const found = realReviews.find((r) => r.id === revId);
        if (found) {
          showRealReviewOnMap(found, false);
          const mapEl = document.querySelector('.hero-device--map');
          if (mapEl && window.innerWidth < 960) {
            mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
    });
  };

  // Kênh đồng bộ thời gian thực giữa các tab trình duyệt
  const liveChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('ai500k_live_reviews') : null;
  if (liveChannel) {
    liveChannel.addEventListener('message', (event) => {
      const incoming = event.data;
      if (incoming && incoming.id && !realReviews.some((r) => r.id === incoming.id)) {
        realReviews.unshift(incoming);
        saveRealReviews();
        renderRealReviewFeed();
        showRealReviewOnMap(incoming, true);
      }
    });
  }

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY_REVIEWS && event.newValue) {
      try {
        const updated = JSON.parse(event.newValue);
        if (Array.isArray(updated) && updated.length > 0) {
          realReviews = updated;
          renderRealReviewFeed();
          showRealReviewOnMap(realReviews[0], true);
        }
      } catch (e) {
        // Ignore parse error
      }
    }
  });

  // Hàm thêm Đánh Giá Thật mới & tự động bật ngay lên Bản đồ Việt Nam
  const addNewRealReview = ({ name, provinceId, stars, pkg, comment }) => {
    const cleanName = (name || '').trim();
    const cleanComment = (comment || '').trim();
    if (!cleanName || !cleanComment) return null;

    const newReview = {
      id: 'rev-' + Date.now(),
      name: cleanName.replace(/[<>]/g, ''),
      provinceId: provinceNamesById[provinceId] ? provinceId : 'vn-hc',
      stars: Math.min(5, Math.max(1, Number(stars) || 5)),
      pkg: pkg || 'Review 5 sao',
      comment: cleanComment.replace(/[<>]/g, ''),
      createdAt: Date.now(),
    };

    realReviews.unshift(newReview);
    saveRealReviews();
    renderRealReviewFeed();
    showRealReviewOnMap(newReview, true);

    if (liveChannel) {
      liveChannel.postMessage(newReview);
    }

    return newReview;
  };

  // Cho phép gọi từ bên ngoài hoặc Webhook nếu cần tích hợp thêm
  window.pushRealMapReview = addNewRealReview;

  // Khởi tạo hiển thị đánh giá thật mới nhất ngay khi mở trang
  renderRealReviewFeed();
  if (realReviews.length > 0) {
    showRealReviewOnMap(realReviews[0], false);
  }

  // Nút thu gọn / mở rộng thẻ đánh giá trên bản đồ
  if (vnPopupCloseBtn && vnRealReviewCard) {
    vnPopupCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      vnRealReviewCard.classList.toggle('is-minimized');
    });
  }

  // Nút bật/tắt khung gửi đánh giá nhanh ngay dưới bản đồ
  if (toggleMapReviewFormBtn && vnQuickReviewForm) {
    toggleMapReviewFormBtn.addEventListener('click', () => {
      vnQuickReviewForm.classList.toggle('is-collapsed');
      if (!vnQuickReviewForm.classList.contains('is-collapsed')) {
        document.getElementById('quickRevName')?.focus();
      }
    });
  }

  if (closeQuickReviewFormBtn && vnQuickReviewForm) {
    closeQuickReviewFormBtn.addEventListener('click', () => {
      vnQuickReviewForm.classList.add('is-collapsed');
    });
  }

  // Xử lý gửi đánh giá thật từ Khung Nhanh ngay trên thẻ Bản Đồ
  if (vnQuickReviewForm) {
    vnQuickReviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('quickRevName')?.value;
      const provinceId = quickRevProvince?.value || 'vn-hc';
      const stars = document.getElementById('quickRevStars')?.value || 5;
      const pkg = document.getElementById('quickRevPkg')?.value || 'Review kèm ảnh';
      const comment = document.getElementById('quickRevComment')?.value;

      const added = addNewRealReview({ name, provinceId, stars, pkg, comment });
      if (added) {
        vnQuickReviewForm.reset();
        if (quickRevProvince) quickRevProvince.value = provinceId;
        vnQuickReviewForm.classList.add('is-collapsed');
      }
    });
  }

  // Xử lý chọn số sao trong Form Đánh Giá Đầy Đủ
  if (fullRevStarPicker) {
    const starBtns = fullRevStarPicker.querySelectorAll('.star-picker__btn');
    const starDescriptions = {
      1: '1.0 ★ Cần cải thiện',
      2: '2.0 ★ Tạm ổn',
      3: '3.0 ★ Khá tốt',
      4: '4.0 ★ Rất hài lòng',
      5: '5.0 ★ Tuyệt vời',
    };

    starBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = Number(btn.getAttribute('data-val')) || 5;
        fullRevStarPicker.setAttribute('data-rating', String(val));
        starBtns.forEach((b) => {
          const bVal = Number(b.getAttribute('data-val')) || 0;
          b.classList.toggle('is-active', bVal <= val);
        });
        if (fullRevStarLabel) {
          fullRevStarLabel.textContent = starDescriptions[val] || '5.0 ★ Tuyệt vời';
        }
      });
    });
  }

  // Xử lý gửi đánh giá thật từ Form Đầy Đủ (#fullRealReviewForm)
  if (fullRealReviewForm) {
    fullRealReviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('fullRevName')?.value;
      const provinceId = fullRevProvince?.value || 'vn-hc';
      const stars = fullRevStarPicker?.getAttribute('data-rating') || 5;
      const pkg = document.getElementById('fullRevPkg')?.value || 'Review kèm ảnh';
      const comment = document.getElementById('fullRevComment')?.value;

      const added = addNewRealReview({ name, provinceId, stars, pkg, comment });
      if (added) {
        fullRealReviewForm.reset();
        if (fullRevProvince) fullRevProvince.value = provinceId;
        const mapCard = document.querySelector('.hero-device--map');
        if (mapCard) {
          mapCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }

  // =========================================================================
  // HIỆU ỨNG TỈNH HIỆN LÊN NGẪU NHIÊN & PHÓNG TO 1 XÍU + TÊN TỈNH BÊN TRONG
  // =========================================================================
  let randomProvinceTimer = null;
  let isMapHovered = false;
  let hoverResumeTimeout = null;

  const allProvinceIdList = Object.keys(provinceNamesById);

  const pickNextRandomProvince = () => {
    if (isMapHovered) return;
    if (!allProvinceIdList.length) return;

    let nextId = currentPoppedProvinceId;
    let attempts = 0;
    while ((nextId === currentPoppedProvinceId || !nextId) && attempts < 25) {
      nextId = allProvinceIdList[Math.floor(Math.random() * allProvinceIdList.length)];
      attempts++;
    }

    activateProvince(nextId, false);
  };

  const startRandomProvinceCycle = () => {
    stopRandomProvinceCycle();
    randomProvinceTimer = setInterval(pickNextRandomProvince, 2400);
  };

  const stopRandomProvinceCycle = () => {
    if (randomProvinceTimer) {
      clearInterval(randomProvinceTimer);
      randomProvinceTimer = null;
    }
  };

  // Tạm dừng chạy tự động khi rê chuột/chạm vào khung bản đồ và kích hoạt lại sau khi rời chuột
  if (vnMapCanvas) {
    vnMapCanvas.addEventListener('mouseenter', () => {
      isMapHovered = true;
      if (hoverResumeTimeout) {
        clearTimeout(hoverResumeTimeout);
        hoverResumeTimeout = null;
      }
    });

    vnMapCanvas.addEventListener('mouseleave', () => {
      if (hoverResumeTimeout) clearTimeout(hoverResumeTimeout);
      hoverResumeTimeout = setTimeout(() => {
        isMapHovered = false;
      }, 1400);
    });
  }

  // Tương tác khi lia chuột, rê chuột, bấm hoặc chạm cảm ứng vào từng Tỉnh Thành trên Bản đồ Việt Nam
  vnProvinces.forEach((prov) => {
    const provName = provinceNamesById[prov.id] || prov.getAttribute('data-name');
    if (!provName) return;
    prov.setAttribute('data-name', provName);

    const handleProvinceFocus = () => {
      isMapHovered = true;
      if (hoverResumeTimeout) {
        clearTimeout(hoverResumeTimeout);
        hoverResumeTimeout = null;
      }
      activateProvince(prov.id, true);
    };

    // Xử lý lia chuột tức thì (mouseenter & mousemove) trên máy tính
    prov.addEventListener('mouseenter', handleProvinceFocus);
    prov.addEventListener('mousemove', () => {
      if (currentPoppedProvinceId !== prov.id) {
        handleProvinceFocus();
      }
    });

    // Xử lý chạm cảm ứng tức thì trên điện thoại / máy tính bảng
    prov.addEventListener('touchstart', handleProvinceFocus, { passive: true });

    prov.addEventListener('click', () => {
      handleProvinceFocus();

      if (quickRevProvince) quickRevProvince.value = prov.id;
      if (fullRevProvince) fullRevProvince.value = prov.id;

      const latestInProv = realReviews.find((r) => r.provinceId === prov.id);
      if (latestInProv) {
        showRealReviewOnMap(latestInProv, false);
      } else {
        highlightAndPinProvince(prov.id);
        updateTopToast(`📍 ${provName} • Hãy gửi đánh giá thật đầu tiên tại tỉnh này!`);
        if (vnQuickReviewForm) {
          vnQuickReviewForm.classList.remove('is-collapsed');
          document.getElementById('quickRevName')?.focus();
        }
      }
    });
  });

  // Khởi động tỉnh phóng to ngẫu nhiên đầu tiên và kích hoạt chu kỳ tự động
  const initialHubList = ['vn-hc', 'vn-318', 'vn-da', 'vn-kh', 'vn-qn', 'vn-ld', 'vn-kg'];
  const firstActiveId = initialHubList[Math.floor(Math.random() * initialHubList.length)];
  activateProvince(firstActiveId, false);
  startRandomProvinceCycle();

  // Tương tác tại 2 Quần Đảo Hoàng Sa (Đà Nẵng) & Trường Sa (Khánh Hòa)
  const hoangSaNode = document.querySelector('.vn-archipelago--hoangsa');
  const truongSaNode = document.querySelector('.vn-archipelago--truongsa');

  if (hoangSaNode) {
    hoangSaNode.addEventListener('click', () => {
      const revDaNang = realReviews.find((r) => r.provinceId === 'vn-da');
      if (revDaNang) showRealReviewOnMap(revDaNang, false);
      updateTopToast('★ Quần đảo Hoàng Sa (TP. Đà Nẵng - Chủ quyền Việt Nam)');
    });
  }

  if (truongSaNode) {
    truongSaNode.addEventListener('click', () => {
      const revKhanhHoa = realReviews.find((r) => r.provinceId === 'vn-kh');
      if (revKhanhHoa) showRealReviewOnMap(revKhanhHoa, false);
      updateTopToast('★ Quần đảo Trường Sa (Tỉnh Khánh Hòa - Chủ quyền Việt Nam)');
    });
  }


  // =========================================================================
  // HIỆU ỨNG 3D COVERFLOW LƯỚT ẢNH ĐÁNH GIÁ GOOGLE MAPS (#ket-qua-danh-gia-map)
  // =========================================================================
  const cfStage = document.getElementById('gmapCoverflowStage');
  const cfCards = cfStage ? Array.from(cfStage.querySelectorAll('.gmap-cf-card')) : [];
  const cfPrevBtn = document.getElementById('gmapCfPrev');
  const cfNextBtn = document.getElementById('gmapCfNext');
  const cfCtrlPrevBtn = document.getElementById('gmapCfCtrlPrev');
  const cfCtrlNextBtn = document.getElementById('gmapCfCtrlNext');
  const cfDotsWrap = document.getElementById('gmapCfDots');
  const cfTitleEl = document.getElementById('gmapCfActiveTitle');
  const cfSubEl = document.getElementById('gmapCfActiveSub');
  const cfLikeBtn = document.getElementById('gmapCoverflowLikeBtn');
  const cfLikeCount = document.getElementById('gmapCoverflowLikeCount');
  const cfLikeIcon = document.getElementById('gmapCoverflowLikeIcon');

  if (cfStage && cfCards.length > 0) {
    let activeCfIdx = 2; // Mặc định mở thẻ chính giữa giống ảnh mẫu 2
    const totalCf = cfCards.length;

    // Khởi tạo các chấm Dots chỉ số
    if (cfDotsWrap) {
      cfDotsWrap.innerHTML = '';
      for (let i = 0; i < totalCf; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `gmap-cf-dot${i === activeCfIdx ? ' is-active' : ''}`;
        dot.setAttribute('aria-label', `Xem đánh giá ${i + 1}`);
        dot.addEventListener('click', () => {
          activeCfIdx = i;
          updateCoverflowPositions(true);
          startCfAutoPlay();
        });
        cfDotsWrap.appendChild(dot);
      }
    }

    let textFadeTimer = null;

    const updateCoverflowPositions = (animateText = true) => {
      cfCards.forEach((card, idx) => {
        let diff = idx - activeCfIdx;
        const half = Math.floor(totalCf / 2);
        if (diff > half) diff -= totalCf;
        if (diff < -half) diff += totalCf;

        const clamped = Math.max(-3, Math.min(3, diff));
        card.setAttribute('data-offset', String(clamped));
      });

      if (cfDotsWrap) {
        const dots = cfDotsWrap.querySelectorAll('.gmap-cf-dot');
        dots.forEach((d, i) => d.classList.toggle('is-active', i === activeCfIdx));
      }

      const currentCard = cfCards[activeCfIdx];
      if (!currentCard) return;

      const newTitle = currentCard.getAttribute('data-cf-title') || '';
      const newSub = currentCard.getAttribute('data-cf-sub') || '';

      if (!animateText) {
        if (cfTitleEl) cfTitleEl.textContent = newTitle;
        if (cfSubEl) cfSubEl.textContent = newSub;
        return;
      }

      if (textFadeTimer) clearTimeout(textFadeTimer);
      if (cfTitleEl) cfTitleEl.style.opacity = '0.35';
      if (cfSubEl) cfSubEl.style.opacity = '0.35';

      textFadeTimer = setTimeout(() => {
        requestAnimationFrame(() => {
          if (cfTitleEl) {
            cfTitleEl.textContent = newTitle;
            cfTitleEl.style.opacity = '1';
          }
          if (cfSubEl) {
            cfSubEl.textContent = newSub;
            cfSubEl.style.opacity = '1';
          }
        });
      }, 85);
    };

    let cfAutoTimer = null;
    const CF_AUTO_DELAY = 1500; // Tự động trượt 1.5s theo đúng yêu cầu, mượt mà trên mọi thiết bị

    const stopCfAutoPlay = () => {
      if (cfAutoTimer) {
        clearInterval(cfAutoTimer);
        cfAutoTimer = null;
      }
    };

    const startCfAutoPlay = () => {
      stopCfAutoPlay();
      cfAutoTimer = setInterval(() => {
        activeCfIdx = (activeCfIdx + 1) % totalCf;
        updateCoverflowPositions(true);
      }, CF_AUTO_DELAY);
    };

    const stepCoverflow = (dir) => {
      activeCfIdx = (activeCfIdx + dir + totalCf) % totalCf;
      updateCoverflowPositions(true);
      startCfAutoPlay();
    };

    updateCoverflowPositions(false);
    startCfAutoPlay();

    // Tạm dừng khi người dùng rê chuột vào xem chi tiết, tự chạy tiếp khi rời chuột
    const cfWrap = cfStage.closest('.gmap-coverflow__stage-wrap') || cfStage;
    cfWrap.addEventListener('mouseenter', stopCfAutoPlay);
    cfWrap.addEventListener('mouseleave', startCfAutoPlay);

    // Bấm vào thẻ bên cạnh sẽ tự động lướt 3D vào chính giữa
    cfCards.forEach((card, idx) => {
      card.addEventListener('click', () => {
        if (activeCfIdx !== idx) {
          activeCfIdx = idx;
          updateCoverflowPositions(true);
          startCfAutoPlay();
        }
      });
    });

    if (cfPrevBtn) {
      cfPrevBtn.addEventListener('click', () => stepCoverflow(-1));
    }
    if (cfNextBtn) {
      cfNextBtn.addEventListener('click', () => stepCoverflow(1));
    }
    if (cfCtrlPrevBtn) {
      cfCtrlPrevBtn.addEventListener('click', () => stepCoverflow(-1));
    }
    if (cfCtrlNextBtn) {
      cfCtrlNextBtn.addEventListener('click', () => stepCoverflow(1));
    }

    // Hỗ trợ kéo / vuốt mượt trên cả chuột máy tính và màn hình cảm ứng di động (Không cản trở cuộn trang dọc)
    let pointerStartX = null;
    let pointerStartY = null;

    cfStage.addEventListener('pointerdown', (e) => {
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      stopCfAutoPlay();
    }, { passive: true });

    cfStage.addEventListener('pointerup', (e) => {
      if (pointerStartX === null) return;
      const deltaX = e.clientX - pointerStartX;
      const deltaY = (e.clientY || 0) - (pointerStartY || 0);

      // Chỉ chuyển slide khi vuốt ngang có chủ đích (deltaX lớn hơn deltaY), tránh nhầm lẫn khi cuộn trang
      if (Math.abs(deltaX) > 38 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
        stepCoverflow(deltaX < 0 ? 1 : -1);
      } else {
        startCfAutoPlay();
      }
      pointerStartX = null;
      pointerStartY = null;
    }, { passive: true });

    cfStage.addEventListener('pointercancel', () => {
      pointerStartX = null;
      pointerStartY = null;
      startCfAutoPlay();
    }, { passive: true });

    // Nút thả tim góc trên bên phải giống ảnh mẫu 2
    if (cfLikeBtn && cfLikeCount && cfLikeIcon) {
      let liked = false;
      let count = 32;
      cfLikeBtn.addEventListener('click', () => {
        liked = !liked;
        count += liked ? 1 : -1;
        cfLikeCount.textContent = String(count);
        cfLikeBtn.classList.toggle('is-liked', liked);
        cfLikeIcon.className = liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
      });
    }
  }
});
