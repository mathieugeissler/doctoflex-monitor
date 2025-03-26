import { formatDate, formatTimeRange, groupConsecutiveTimes } from './dateUtils.js';

export class TableView {
    constructor(tableBodyId) {
        this.tableBody = document.getElementById(tableBodyId);
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.tableContainer = this.tableBody.closest('.overflow-x-auto');
    }

    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.classList.remove('hidden');
            if (this.tableContainer) {
                this.tableContainer.classList.add('hidden');
            }
        }
    }

    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.classList.add('hidden');
            if (this.tableContainer) {
                this.tableContainer.classList.remove('hidden');
            }
        }
    }

    async updateTable(slots) {
        this.showLoading();
        
        try {
            if (!slots || slots.length === 0) {
                this.showEmptyState();
                return;
            }

        // Grouper les créneaux par date
        const slotsByDate = this.groupSlotsByDate(slots);
        this.renderTable(slotsByDate);
    }

    showEmptyState() {
        this.tableBody.innerHTML = `
            <tr>
                <td colspan="2" class="px-6 py-4 text-center text-gray-500 italic">
                    Aucun créneau disponible pour le moment
                </td>
            </tr>
        `;
    }

    groupSlotsByDate(slots) {
        return slots.reduce((acc, slot) => {
            const date = slot.date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(slot.time);
            return acc;
        }, {});
    }

    generateTableRows(slotsByDate) {
        return Object.entries(slotsByDate)
            .map(([date, times]) => {
                const timeGroups = groupConsecutiveTimes(times);
                const formattedDate = formatDate(date);
                const totalSlots = times.length;

                const timeRangesHtml = timeGroups.map(group => {
                    const range = formatTimeRange(group);
                    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mr-2 mb-1">${range}</span>`;
                }).join('');

                return `
                    <tr class="hover:bg-gray-50 transition-colors duration-150">
                        <td class="px-6 py-4">
                            <div class="text-sm font-medium text-gray-900">${formattedDate}</div>
                            <span class="text-xs text-gray-500">${totalSlots} créneau${totalSlots > 1 ? 'x' : ''}</span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex flex-wrap">${timeRangesHtml}</div>
                        </td>
                    </tr>
                `;
            }).join('');

        this.tableBody.innerHTML = rows;
        } finally {
            // Petit délai pour éviter le flash de l'indicateur de chargement
            setTimeout(() => this.hideLoading(), 300);
        }
    }
}
