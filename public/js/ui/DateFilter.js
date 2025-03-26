class DateFilter {
    constructor(slotService) {
        this.slotService = slotService;
        this.startDateInput = document.getElementById('startDate');
        this.endDateInput = document.getElementById('endDate');

        this.initializeListeners();
    }

    initializeListeners() {
        this.startDateInput.addEventListener('change', () => this.updateFilter());
        this.endDateInput.addEventListener('change', () => this.updateFilter());
    }

    updateFilter() {
        const startDate = this.startDateInput.value;
        let endDate = this.endDateInput.value;
        
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            this.endDateInput.value = startDate;
            endDate = startDate;
        }

        this.slotService.updateDateRange(startDate, endDate);
    }

    getDateRange() {
        return {
            startDate: this.startDateInput.value,
            endDate: this.endDateInput.value
        };
    }
}

export default DateFilter;
