// === index.html dan ajratildi (XOLERIC SEO) ===
const editor = document.getElementById('editor');
        const preview = document.getElementById('preview');
        const clearBtn = document.getElementById('clearBtn');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const previewContainer = document.getElementById('previewContainer');

        // Jonli natijani ko'rsatish funksiyasi
        function renderOutput() {
            const code = editor.value;
            const documentTarget = preview.contentWindow.document;
            
            documentTarget.open();
            documentTarget.write(code);
            documentTarget.close();
        }

        // Matn kiritilishi yoki joylanishi (paste) bilan ishlaydi
        editor.addEventListener('input', renderOutput);

        // Kodni tozalash (X) tugmasi
        clearBtn.addEventListener('click', () => {
            editor.value = ''; // Matnni o'chirish
            renderOutput();    // Natijani ham tozalash
            editor.focus();    // Kursorni yana kiritish maydoniga qaytarish
        });

        // Natijani to'liq ekranda ko'rish
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                previewContainer.requestFullscreen().catch(err => {
                    alert(`To'liq ekranga o'tishda xatolik: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        });

        // Ekran rejimi o'zgarganda tugma matnini yangilash (Esc bosilganda ham moslashadi)
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                fullscreenBtn.textContent = "Kichraytirish ✕";
            } else {
                fullscreenBtn.textContent = "To'liq ekran ⛶";
            }
        });