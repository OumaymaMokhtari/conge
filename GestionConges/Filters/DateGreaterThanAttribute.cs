using System;
using System.ComponentModel.DataAnnotations;

namespace GestionConges.Filters 
{
    public class DateGreaterThanAttribute : ValidationAttribute
    {
        private readonly string _otherPropertyName;

        public DateGreaterThanAttribute(string otherPropertyName)
        {
            _otherPropertyName = otherPropertyName;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var otherProperty = validationContext.ObjectType.GetProperty(_otherPropertyName);
            if (otherProperty == null)
                return new ValidationResult($"Propriété {_otherPropertyName} introuvable.");

            var otherValue = (DateTime)otherProperty.GetValue(validationContext.ObjectInstance);
            if ((DateTime)value <= otherValue)
                return new ValidationResult(ErrorMessage);

            return ValidationResult.Success;
        }
    } 
}
