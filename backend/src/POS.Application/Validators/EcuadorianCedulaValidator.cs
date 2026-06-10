namespace POS.Application.Validators;

public static class EcuadorianCedulaValidator
{
    public static bool IsValid(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return false;

        var cedula = value.Trim();
        if (cedula.Length != 10 || !cedula.All(char.IsDigit))
            return false;

        if (!int.TryParse(cedula[..2], out var province) || province is < 1 or > 24)
            return false;

        if (!int.TryParse(cedula[2..3], out var thirdDigit) || thirdDigit >= 6)
            return false;

        var digits = cedula.Select(c => c - '0').ToArray();
        var total = 0;

        for (var i = 0; i < 9; i++)
        {
            var valueDigit = digits[i];
            if (i % 2 == 0)
            {
                valueDigit *= 2;
                if (valueDigit > 9)
                    valueDigit -= 9;
            }

            total += valueDigit;
        }

        var verifier = (10 - (total % 10)) % 10;
        return verifier == digits[9];
    }
}
