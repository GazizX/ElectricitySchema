// Updated levels.js with interactive parameters and clear tasks
export const levels = {
  level1: [
    {
      id: "1a",
      difficulty: "easy",
      time: 180,
      attempts: 3,
      task: "Соберите простую цепь: подключите батарею к лампочке с помощью проводов. Лампочка должна загореться. Убедитесь, что цепь замкнута: от батареи идут два провода — к лампочке и обратно.",
      layout: {
        type: "series",
        elements: ["power", "bulb"],
      },
      availableElements: {
        power: 1,
        bulb: 1,
        wire_h: 4,
        wire_v: 4,
        wire_corner_tr: 1,
        wire_corner_br: 1,
        wire_corner_bl: 1,
        wire_corner_tl: 1,
      },
    },
    {
      id: "1b",
      difficulty: "easy",
      time: 180,
      attempts: 3,
      task: "Соберите цепь: батарея → ключ → лампочка. Цепь работает ТОЛЬКО если ключ замкнут. Кликните по ключу, чтобы включить его.",
      layout: {
        type: "series",
        elements: ["power", "switch", "bulb"],
      },
      availableElements: {
        power: 1,
        bulb: 1,
        switch: 1,
        wire_h: 6,
        wire_v: 4,
        wire_corner_tr: 1,
        wire_corner_br: 1,
        wire_corner_bl: 1,
        wire_corner_tl: 1,
      },
    },
    {
      id: "1c",
      difficulty: "easy",
      time: 200,
      attempts: 3,
      task: "Соберите цепь с двумя лампочками, соединёнными последовательно. Обе лампочки должны загореться.",
      layout: {
        type: "series",
        elements: ["power", "bulb", "bulb"],
      },
      availableElements: {
        power: 1,
        bulb: 2,
        wire_h: 8,
        wire_v: 6,
        wire_corner_tr: 2,
        wire_corner_br: 2,
        wire_corner_bl: 2,
        wire_corner_tl: 2,
      },
    },
    {
      id: "1d",
      difficulty: "easy",
      time: 200,
      attempts: 3,
      task: "Соберите цепь: батарея → ключ → лампочка → лампочка. Обе лампочки горят только при включённом ключе.",
      layout: {
        type: "series",
        elements: ["power", "switch", "bulb", "bulb"],
      },
      availableElements: {
        power: 1,
        bulb: 2,
        switch: 1,
        wire_h: 10,
        wire_v: 8,
        wire_corner_tr: 2,
        wire_corner_br: 2,
        wire_corner_bl: 2,
        wire_corner_tl: 2,
      },
    },
  ],

  level2: [
    {
      id: "2a",
      difficulty: "easy",
      time: 240,
      attempts: 3,
      task: "Соберите цепь: батарея (9 В) → резистор (100 Ом) → лампочка. После сборки <b>кликните по лампочке</b> и введите силу тока в амперах.",
      layout: {
        type: "series",
        elements: ["power", "resistor", "bulb"],
      },
      parameters: {
        target: { element: "bulb", property: "current", unit: "А", answer: 0.09 },
        given: [
          { element: "power", property: "voltage", value: 9, unit: "В" },
          { element: "resistor", property: "resistance", value: 100, unit: "Ом" }
        ]
      },
      availableElements: {
        power: 1,
        bulb: 1,
        resistor: 1,
        wire_h: 8,
        wire_v: 6,
        wire_corner_tr: 1,
        wire_corner_br: 1,
        wire_corner_bl: 1,
        wire_corner_tl: 1,
      },
    },
    {
      id: "2b",
      difficulty: "medium",
      time: 240,
      attempts: 3,
      task: "Соберите цепь: батарея (12 В) → ключ → резистор → лампочка. Сила тока в цепи — 0.06 А. После сборки <strong>кликните по резистору</strong> и введите его сопротивление в омах.",
      layout: {
        type: "series",
        elements: ["power", "switch", "resistor", "bulb"],
      },
      parameters: {
        target: { element: "resistor", property: "resistance", unit: "Ом", answer: 200 },
        given: [
          { element: "power", property: "voltage", value: 12, unit: "В" },
          { element: "bulb", property: "current", value: 0.06, unit: "А" }
        ]
      },
      availableElements: {
        power: 1,
        bulb: 1,
        resistor: 1,
        switch: 1,
        wire_h: 10,
        wire_v: 6,
        wire_corner_tr: 1,
        wire_corner_br: 1,
        wire_corner_bl: 1,
        wire_corner_tl: 1,
      },
    },
    {
      id: "2c",
      difficulty: "medium",
      time: 240,
      attempts: 3,
      task: "Соберите цепь: батарея (12 В) → ключ → резистор (200 Ом) → лампочка → лампочка. После сборки <strong>кликните по любой лампочке</strong> и введите силу тока в амперах.",
      layout: {
        type: "series",
        elements: ["power", "switch", "resistor", "bulb", "bulb"],
      },
      parameters: {
        target: { element: "bulb", property: "current", unit: "А", answer: 0.06 },
        given: [
          { element: "power", property: "voltage", value: 12, unit: "В" },
          { element: "resistor", property: "resistance", value: 200, unit: "Ом" }
        ]
      },
      availableElements: {
        power: 1,
        bulb: 2,
        resistor: 1,
        switch: 1,
        wire_h: 12,
        wire_v: 10,
        wire_corner_tr: 2,
        wire_corner_br: 2,
        wire_corner_bl: 2,
        wire_corner_tl: 2,
      },
    },
  ],

  level3: [
  {
    id: "3a",
    difficulty: "hard",
    time: 300,
    attempts: 3,
    task: `Соберите цепь по схеме и введите силу тока.<br>
           <small>Формула: I = U / (R₁ + R₂)<br>
           Дано на схеме: U = 12 В, R₁ = 100 Ом, R₂ = 200 Ом</small><br>
           <img src="./assets/schemas/schema3a.png" style="width:300px; margin-top:8px;">`,
    layout: {
      type: "series",
      elements: ["power", "resistor", "resistor", "bulb"],
    },
    parameters: {
      target: { element: "bulb", property: "current", unit: "А", answer: 0.04 },
      given: [
        { element: "power", property: "voltage", value: 12, unit: "В" },
        { element: "resistor", property: "resistance", value: 100, unit: "Ом" }, // R1
        { element: "resistor", property: "resistance", value: 200, unit: "Ом" }  // R2
      ]
    },
    availableElements: {
      power: 1,
      bulb: 1,
      resistor: 2,
      wire_h: 10,
      wire_v: 8,
      wire_corner_tr: 2,
      wire_corner_br: 2,
      wire_corner_bl: 2,
      wire_corner_tl: 2,
    },
  },
  {
    id: "3b",
    difficulty: "hard",
    time: 300,
    attempts: 3,
    task: `Соберите цепь по схеме и введите напряжение источника.<br>
           <small>Формула: U = I × (R₁ + R₂ + R₃)<br>
           Дано на схеме: I = 0.3 А, R₁ = 10 Ом, R₂ = 20 Ом, R₃ = 20 Ом</small><br>
           <img src="./assets/schemas/schema3b.png" style="width:300px; margin-top:8px;">`,
    layout: {
      type: "series",
      elements: ["power", "resistor", "resistor", "resistor", "bulb"],
    },
    parameters: {
      target: { element: "power", property: "voltage", unit: "В", answer: 15 },
      given: [
        { element: "bulb", property: "current", value: 0.3, unit: "А" },
        { element: "resistor", property: "resistance", value: 10, unit: "Ом" }, // R1
        { element: "resistor", property: "resistance", value: 20, unit: "Ом" }, // R2
        { element: "resistor", property: "resistance", value: 20, unit: "Ом" }  // R3
      ]
    },
    availableElements: {
      power: 1,
      bulb: 1,
      resistor: 3,
      wire_h: 12,
      wire_v: 10,
      wire_corner_tr: 2,
      wire_corner_br: 2,
      wire_corner_bl: 2,
      wire_corner_tl: 2,
    },
  },
  {
    id: "3c",
    difficulty: "hard",
    time: 300,
    attempts: 3,
    task: `Соберите цепь по схеме и введите сопротивление первого резистора.<br>
           <small>Формула: R₁ = (U / I) − R₂<br>
           Дано на схеме: U = 12 В, I = 0.08 А, R₂ = 50 Ом</small><br>
           <img src="./assets/schemas/schema3c.png" style="width:300px; margin-top:8px;">`,
    layout: {
      type: "series",
      elements: ["power", "switch", "resistor", "resistor", "bulb", "bulb"],
    },
    parameters: {
      target: { element: "resistor", property: "resistance", unit: "Ом", answer: 100 },
      given: [
        { element: "power", property: "voltage", value: 12, unit: "В" },
        { element: "bulb", property: "current", value: 0.08, unit: "А" },
        { element: "resistor", property: "resistance", value: 50, unit: "Ом" } // R2
      ]
    },
    availableElements: {
      power: 1,
      bulb: 2,
      resistor: 2,
      switch: 1,
      wire_h: 14,
      wire_v: 12,
      wire_corner_tr: 2,
      wire_corner_br: 2,
      wire_corner_bl: 2,
      wire_corner_tl: 2,
    },
  },
],
};