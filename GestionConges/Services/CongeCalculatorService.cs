using System;
using System.Collections.Generic;
using System.Linq;

namespace GestionConges.Services
{
    public class CongeCalculatorService
    {
        private readonly List<string> joursFeriesFixes = new List<string>
        {
            "01-01", "11-01", "05-01", "07-30", "08-14", "08-20", "08-21",
            "11-06", "11-18"
        };

        private readonly List<DateTime> joursFeriesMobiles = new List<DateTime>
        {
            new DateTime(2025, 4, 1), 
            new DateTime(2025, 6, 27), 
            new DateTime(2025, 10, 5)  
        };

        public int CalculerJoursOuvres(DateTime dateDebut, DateTime dateFin)
        {
            int joursOuvres = 0;
            DateTime currentDate = dateDebut;

            while (currentDate <= dateFin)
            {
                bool estWeekend = (currentDate.DayOfWeek == DayOfWeek.Saturday || currentDate.DayOfWeek == DayOfWeek.Sunday);
                bool estFerieFixe = joursFeriesFixes.Contains(currentDate.ToString("MM-dd"));
                bool estFerieMobile = joursFeriesMobiles.Any(jf => jf.Date == currentDate.Date);

                if (!estWeekend && !estFerieFixe && !estFerieMobile)
                {
                    joursOuvres++;
                }

                currentDate = currentDate.AddDays(1);
            }

            return joursOuvres;
        }
    }
}
