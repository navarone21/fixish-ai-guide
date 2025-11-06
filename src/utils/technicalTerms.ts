export interface TechnicalTerm {
  term: string;
  definition: string;
  category: string;
}

export const technicalTermsDatabase: TechnicalTerm[] = [
  // Automotive
  { term: "torque", definition: "Rotational force measured in lb-ft or Nm, indicating how much twisting power an engine produces", category: "automotive" },
  { term: "gasket", definition: "A seal between two surfaces to prevent leaks of fluids or gases", category: "automotive" },
  { term: "alternator", definition: "Generates electrical power to charge the battery and power electrical systems while the engine runs", category: "automotive" },
  { term: "brake caliper", definition: "Houses brake pads and uses hydraulic pressure to squeeze them against the rotor to stop the vehicle", category: "automotive" },
  { term: "timing belt", definition: "Synchronizes the rotation of the crankshaft and camshaft for proper engine valve timing", category: "automotive" },
  { term: "catalytic converter", definition: "Reduces harmful emissions by converting toxic gases into less harmful substances", category: "automotive" },
  { term: "cv joint", definition: "Constant Velocity joint that allows the drive shaft to transmit power through a variable angle", category: "automotive" },
  { term: "serpentine belt", definition: "Single, continuous belt that drives multiple peripheral devices like alternator, AC compressor, and power steering pump", category: "automotive" },
  
  // Electronics
  { term: "pcb", definition: "Printed Circuit Board - a board with electrical circuits connecting electronic components", category: "electronics" },
  { term: "capacitor", definition: "Electronic component that stores and releases electrical energy, used for filtering and timing", category: "electronics" },
  { term: "resistor", definition: "Limits or regulates the flow of electrical current in a circuit", category: "electronics" },
  { term: "transistor", definition: "Semiconductor device used to amplify or switch electronic signals", category: "electronics" },
  { term: "diode", definition: "Allows current to flow in only one direction, used for rectification and protection", category: "electronics" },
  { term: "relay", definition: "Electrically operated switch controlled by a low-power signal to switch a higher-power circuit", category: "electronics" },
  { term: "fuse", definition: "Safety device that protects circuits by breaking the connection when current exceeds safe levels", category: "electronics" },
  { term: "mosfet", definition: "Metal-Oxide-Semiconductor Field-Effect Transistor used for switching and amplifying electronic signals", category: "electronics" },
  
  // Appliances
  { term: "compressor", definition: "Pressurizes refrigerant in cooling systems like refrigerators and air conditioners", category: "appliances" },
  { term: "thermostat", definition: "Device that maintains desired temperature by controlling heating/cooling systems", category: "appliances" },
  { term: "solenoid", definition: "Electromagnetic coil that converts electrical energy into linear mechanical motion", category: "appliances" },
  { term: "heating element", definition: "Converts electrical energy into heat, used in appliances like ovens and water heaters", category: "appliances" },
  { term: "thermal fuse", definition: "One-time safety device that cuts power when temperature exceeds safe limits", category: "appliances" },
  
  // General Tools & Hardware
  { term: "allen wrench", definition: "L-shaped hexagonal tool used to drive bolts and screws with hexagonal sockets", category: "tools" },
  { term: "multimeter", definition: "Measures voltage, current, and resistance in electrical circuits", category: "tools" },
  { term: "torque wrench", definition: "Tightens fasteners to a specific torque value to prevent over or under-tightening", category: "tools" },
  { term: "continuity", definition: "Complete electrical path allowing current to flow, tested with a multimeter", category: "electrical" },
  { term: "short circuit", definition: "Unintended low-resistance connection that allows excessive current flow, often causing damage", category: "electrical" },
  { term: "ground wire", definition: "Safety wire that provides a path for electrical current to safely reach the earth", category: "electrical" },
  { term: "voltage", definition: "Electrical pressure or potential difference measured in volts", category: "electrical" },
  { term: "amperage", definition: "Rate of electrical flow measured in amperes (amps)", category: "electrical" },
  { term: "wattage", definition: "Rate of energy transfer or power consumption measured in watts", category: "electrical" },
  
  // Plumbing
  { term: "o-ring", definition: "Circular rubber seal used to prevent leaks in fittings and connections", category: "plumbing" },
  { term: "shut-off valve", definition: "Controls water flow by opening or closing a passage", category: "plumbing" },
  { term: "ptfe tape", definition: "Teflon tape wrapped around pipe threads to create watertight seals", category: "plumbing" },
  { term: "trap", definition: "U-shaped pipe section that holds water to prevent sewer gases from entering a building", category: "plumbing" },
];

export const detectTechnicalTerms = (text: string): Map<string, TechnicalTerm> => {
  const detectedTerms = new Map<string, TechnicalTerm>();
  const lowerText = text.toLowerCase();
  
  for (const termData of technicalTermsDatabase) {
    // Match whole words only (with word boundaries)
    const regex = new RegExp(`\\b${termData.term.toLowerCase()}\\b`, 'gi');
    if (regex.test(lowerText)) {
      detectedTerms.set(termData.term.toLowerCase(), termData);
    }
  }
  
  return detectedTerms;
};

export const parseTextWithTerms = (text: string): Array<{ text: string; isTerm: boolean; termData?: TechnicalTerm }> => {
  const detectedTerms = detectTechnicalTerms(text);
  
  if (detectedTerms.size === 0) {
    return [{ text, isTerm: false }];
  }
  
  // Create regex pattern for all detected terms
  const termsArray = Array.from(detectedTerms.keys());
  const pattern = new RegExp(`\\b(${termsArray.join('|')})\\b`, 'gi');
  
  const parts: Array<{ text: string; isTerm: boolean; termData?: TechnicalTerm }> = [];
  let lastIndex = 0;
  let match;
  
  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isTerm: false });
    }
    
    // Add the matched term
    const termData = detectedTerms.get(match[0].toLowerCase());
    parts.push({
      text: match[0],
      isTerm: true,
      termData: termData
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isTerm: false });
  }
  
  return parts;
};
