const { parse, parseISO, startOfDay } = require('date-fns');

class SlotFilter {
    filterByDateRange(slots, startDate = null, endDate = null) {
        if (!startDate && !endDate) {
            return slots;
        }

        return slots.filter(slot => {
            const slotDate = startOfDay(parse(slot.date, 'dd/MM/yyyy', new Date()));
            
            if (startDate && !endDate) {
                const start = startOfDay(parseISO(startDate));
                return slotDate.getTime() === start.getTime() || slotDate.getTime() > start.getTime();
            }
            
            if (!startDate && endDate) {
                const end = startOfDay(parseISO(endDate));
                return slotDate.getTime() === end.getTime() || slotDate.getTime() < end.getTime();
            }
            
            const start = startOfDay(parseISO(startDate));
            const end = startOfDay(parseISO(endDate));
            
            return (
                slotDate.getTime() === start.getTime() || 
                slotDate.getTime() === end.getTime() || 
                (slotDate.getTime() > start.getTime() && slotDate.getTime() < end.getTime())
            );
        });
    }
}

module.exports = SlotFilter;
