// Download Modal Functions
function openDownloadModal() {
    const modal = document.getElementById('downloadModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDownloadModal() {
    // If user is not signed in, reopen auth modal
    const session = checkUserSession();
    const modal = document.getElementById('downloadModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function downloadVulkan() {
    const fileId = '1oAkT0qn4C3V-IrdB7-hpx3AA9-KGwvzo';
    const downloadUrl = `https://github.com/Feeder029/KalayaAndroid-Webs/releases/download/v1.0/KalayaAndoid.Vulkan.apk`;
    window.open(downloadUrl, '_blank');
}

function downloadOpenGL() {
    const fileId = '1aw0pp1qIPIEqUsNm1oxijUAgu4jH__QN';
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    window.open(downloadUrl, '_blank');
}

// Close download modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const downloadModal = document.getElementById('downloadModal');
    if (downloadModal) {
        downloadModal.addEventListener('click', function(e) {
            if (e.target === this) closeDownloadModal();
        });
    }
});

// Smooth scrolling for navigation links — skip empty # hrefs
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;   // ← fix: ignore bare # links
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Toggle character description
function toggleDescription(button) {
    const card = button.closest('.role-card');
    card.classList.toggle('expanded');
    button.textContent = card.classList.contains('expanded') ? 'Read Less' : 'Read More';
}

// Gallery functionality
let currentGalleryIndex = 0;
const galleryImages = [
    'img/FORMATION.png',
    'img/PUGAD LAWIN.png',
    'img/SJDM.png',
    'img/RIZAL EXE.png',
    'img/TEJEROS.png',
    'img/BONIFACIO DOWNFALL.png',
    'img/PACK BIAK NA BATO.png',
    'img/EXILE_RETURN.png',
    'img/INDEPENDENCE.png'
];

const galleryTitles = [
    'Formation of the Katipunan',
    'Cry of Pugad Lawin',
    'Battle of San Juan del Monte',
    'Execution of José Rizal',
    'Tejeros Convention',
    'Bonifacio\'s Downfall',
    'Pact of Biak-na-Bato',
    'Return from Exile',
    'Philippine Independence'
];

function openGallery(index) {
    currentGalleryIndex = index;
    const modal = document.getElementById('galleryModal');
    const content = document.getElementById('modalContent');
    content.innerHTML = '<img src="' + galleryImages[index] + '" alt="' + galleryTitles[index] + '">';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeGallery() {
    const modal = document.getElementById('galleryModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function changeGalleryImage(direction) {
    currentGalleryIndex += direction;
    if (currentGalleryIndex < 0) {
        currentGalleryIndex = galleryImages.length - 1;
    } else if (currentGalleryIndex >= galleryImages.length) {
        currentGalleryIndex = 0;
    }
    const content = document.getElementById('modalContent');
    content.innerHTML = '<img src="' + galleryImages[currentGalleryIndex] + '" alt="' + galleryTitles[currentGalleryIndex] + '">';
}

// Close gallery modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const galleryModal = document.getElementById('galleryModal');
    if (galleryModal) {
        galleryModal.addEventListener('click', function(e) {
            if (e.target === this) closeGallery();
        });
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    const galleryModal = document.getElementById('galleryModal');
    if (galleryModal && galleryModal.classList.contains('active')) {
        if (e.key === 'ArrowLeft')  changeGalleryImage(-1);
        if (e.key === 'ArrowRight') changeGalleryImage(1);
        if (e.key === 'Escape')     closeGallery();
    }

    const downloadModal = document.getElementById('downloadModal');
    if (downloadModal && downloadModal.classList.contains('active') && e.key === 'Escape') {
        closeDownloadModal();
    }
});

console.log('Katipunan Game - Landing page loaded with authentication integration');