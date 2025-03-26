class SlotDisplay {
    constructor(slotService) {
        this.slotService = slotService;
        this.container = document.getElementById('slots-container');
        this.lastUpdateContainer = document.getElementById('last-update');
    }

    async displaySlots(slots) {
        // Récupérer la date de dernière mise à jour
        const lastUpdate = await this.slotService.getLastUpdate();
        this.updateLastUpdateDisplay(lastUpdate);
        this.container.innerHTML = '';
        
        if (!slots || slots.length === 0) {
            this.showNoSlotsMessage();
            return;
        }

        // Grouper les créneaux par date
        const slotsByDate = this.groupSlotsByDate(slots);
        
        // Créer une carte pour chaque date
        Object.entries(slotsByDate).forEach(([date, daySlots]) => {
            const card = this.createDateCard(date, daySlots);
            this.container.appendChild(card);
        });
    }

    groupSlotsByDate(slots) {
        return slots.reduce((acc, slot) => {
            const date = slot.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(slot);
            return acc;
        }, {});
    }

    createDateCard(date, slots) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-6 mb-6';
        
        // En-tête de la carte avec la date
        const header = document.createElement('div');
        header.className = 'flex items-center justify-between mb-4';
        header.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-900">${this.slotService.formatDate(date)}</h3>
            <span class="text-sm text-gray-500">${slots.length} créneau${slots.length > 1 ? 'x' : ''}</span>
        `;
        
        // Container pour les chips des heures
        const timeChips = document.createElement('div');
        timeChips.className = 'flex flex-wrap gap-2';
        
        // Créer une chip pour chaque heure
        slots.forEach(slot => {
            const chip = document.createElement('button');
            chip.className = 'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors';
            chip.setAttribute('data-slot-id', slot.id);
            chip.textContent = slot.time;
            
            chip.addEventListener('click', () => {
                window.open(slot.bookingUrl, '_blank');
            });
            
            timeChips.appendChild(chip);
        });
        
        card.appendChild(header);
        card.appendChild(timeChips);
        return card;
    }

    showNoSlotsMessage() {
        const message = document.createElement('div');
        message.className = 'bg-white rounded-lg shadow-md p-6 text-center text-gray-500';
        message.textContent = 'Aucun créneau disponible';
        this.container.appendChild(message);
    }

    clear() {
        this.container.innerHTML = '';
    }
    updateLastUpdateDisplay(lastUpdate) {
        if (!this.lastUpdateContainer) return;

        if (lastUpdate) {
            const date = new Date(lastUpdate);
            const formattedDate = date.toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            this.lastUpdateContainer.textContent = `Dernière mise à jour : ${formattedDate}`;
            this.lastUpdateContainer.classList.remove('hidden');
        } else {
            this.lastUpdateContainer.classList.add('hidden');
        }
    }
}

export default SlotDisplay;
