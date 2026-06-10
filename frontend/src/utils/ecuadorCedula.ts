export function isValidEcuadorianCedula(value: string): boolean {
  const cedula = value.trim();
  if (!/^\d{10}$/.test(cedula)) return false;

  const province = Number(cedula.slice(0, 2));
  if (province < 1 || province > 24) return false;

  const thirdDigit = Number(cedula[2]);
  if (thirdDigit >= 6) return false;

  let total = 0;
  for (let i = 0; i < 9; i++) {
    let digit = Number(cedula[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    total += digit;
  }

  const verifier = (10 - (total % 10)) % 10;
  return verifier === Number(cedula[9]);
}
