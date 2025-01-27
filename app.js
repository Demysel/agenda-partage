const JSONBIN_API_KEY = '$2a$10$j99ZptquF7iTqI/UP0xQMucBLqWZW/8bTlz859GxEqzmmfq0DpR4.';
const JSONBIN_BIN_ID = '6794ec2de41b4d34e47e7ce5';

let currentDate = new Date();
let selectedEvent = null;
let currentTheme = localStorage.getItem('theme') || 'light';

// Configuration CORS pour JSONBin.io
const corsHeaders = {
  'Content-Type': 'application/json',
  'X-Master-Key': '$$2a$10$j99ZptquF7iTqI/UP0xQMucBLqWZW/8bTlz859GxEqzmmfq0DpR4.',
  'Access-Control-Allow-Origin': 'https://dreamy-dolphin-b8aa6f.netlify.app'
};

async function loadEvents() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/6794ec2de41b4d34e47e7ce5/latest`, {
      headers: corsHeaders
    });
    const data = await response.json();
    return data.record.events || [];
  } catch (error) {
    console.error('Erreur de chargement:', error);
    return [];
  }
}

    // Sauvegarder les événements
    async function saveEvents(events) {
        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({ events })
        });
    }

    // Initialiser FullCalendar
    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: false,
        events: await loadEvents(),
        eventColor: '#378006',
        eventClick: (info) => openEditModal(info.event),
        dateClick: (info) => openCreateModal(info.date),
        eventDidMount: (info) => {
            info.el.style.backgroundColor = getEventColor(info.event.extendedProps.type);
        }
    });

    calendar.render();

    // Gestion du dark mode
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', () => {
        document.body.dataset.theme = document.body.dataset.theme === 'dark' ? '' : 'dark';
    });

    // Gestion des vues
    document.getElementById('viewSelector').addEventListener('change', (e) => {
        calendar.changeView(e.target.value);
    });

    // Gestion du modal
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');

    window.openCreateModal = (date) => {
        currentEventId = null;
        document.getElementById('eventStart').value = date.toISOString().slice(0, 16);
        modal.style.display = 'block';
    };

    window.openEditModal = (event) => {
        currentEventId = event.id;
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventType').value = event.extendedProps.type;
        document.getElementById('eventStart').value = event.start.toISOString().slice(0, 16);
        document.getElementById('eventEnd').value = event.end?.toISOString().slice(0, 16) || '';
        document.getElementById('eventLocation').value = event.extendedProps.location || '';
        document.getElementById('eventRecurrence').value = event.extendedProps.recurrence || '';
        modal.style.display = 'block';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const events = await loadEvents();

        const eventData = {
            id: currentEventId || Date.now().toString(),
            title: document.getElementById('eventTitle').value,
            start: document.getElementById('eventStart').value,
            end: document.getElementById('eventEnd').value || null,
            extendedProps: {
                type: document.getElementById('eventType').value,
                location: document.getElementById('eventLocation').value,
                recurrence: document.getElementById('eventRecurrence').value
            }
        };

        const index = events.findIndex(e => e.id === currentEventId);
        if (index > -1) {
            events[index] = eventData;
        } else {
            events.push(eventData);
        }

        await saveEvents(events);
        calendar.refetchEvents();
        modal.style.display = 'none';
    });

    document.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    function getEventColor(type) {
        const colors = {
            perso: '#ff6b6b',
            pro: '#4ecdc4',
            enfant: '#ffe66d'
        };
        return colors[type] || '#378006';
    }
});
