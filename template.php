<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Easy JSON Editor</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js" defer></script>
    <script src="script.js" defer></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>JSON Editor</h1>
        </header>

        <form id="jsonForm">
            <!-- Sections -->
            <section class="section" data-section-id="reward_items">
                <div class="section-header">
                    <h2>Reward Items</h2>
                    <span class="toggle-btn"><i class="fas fa-chevron-down"></i></span>
                </div>
                <div class="section-content">
                    <div class="reward_items items-container"></div>
                    <button type="button" class="add-btn" data-add-btn="reward_items">
                        <i class="fas fa-plus"></i> Add Item
                    </button>
                </div>
            </section>

            <section class="section" data-section-id="required_items">
                <div class="section-header">
                    <h2>Required Items</h2>
                    <span class="toggle-btn"><i class="fas fa-chevron-down"></i></span>
                </div>
                <div class="section-content">
                    <div class="required_items items-container"></div>
                    <button type="button" class="add-btn" data-add-btn="required_items">
                        <i class="fas fa-plus"></i> Add Item
                    </button>
                </div>
            </section>

            <section class="section" data-section-id="move_to">
                <div class="section-header">
                    <h2>Move To</h2>
                    <span class="toggle-btn"><i class="fas fa-chevron-down"></i></span>
                </div>
                <div class="section-content">
                    <label>
                        <input type="checkbox" name="move_to[completes_quest_step]" id="move_to_completes_quest_step">
                        Attempt to complete quest step
                    </label>
                    <div class="move_to items-container"></div>
                    <button type="button" class="add-btn" data-add-btn="move_to">
                        <i class="fas fa-plus"></i> Add Target
                    </button>
                </div>
            </section>
        </form>

        <section class="output-section">
            <h2>Generated JSON</h2>
            <textarea id="jsonOutput" readonly></textarea>
        </section>
    </div>

    <!-- templates -->
    <template id="item-template">
        <div class="item">
            <div class="item-header">
                <div>
                    <span class="item-number">#</span>
                    <span class="item-summary"><span class="summary-display">—</span></span>
                </div>
                <div class="item-buttons">
                    <span class="drag-handle"><i class="fas fa-arrows-alt"></i></span>
                    <button type="button" class="toggle-item-btn"><i class="fas fa-chevron-down"></i></button>
                    <button type="button" class="remove-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <div class="item-content"></div>
        </div>
    </template>

    <template id="reward_items-template">
        <label>Item ID:</label>
        <input type="number" name="reward_items[id]" required placeholder="ID" data-label="Item ID">
        <label>Quantity:</label>
        <input type="number" name="reward_items[value]" required placeholder="Quantity" data-label="Quantity">
    </template>

    <template id="required_items-template">
        <label>Item ID:</label>
        <input type="number" name="required_items[id]" required placeholder="ID" data-label="Item ID">
        <label>Quantity:</label>
        <input type="number" name="required_items[value]" required placeholder="Quantity" data-label="Quantity">
    </template>

    <template id="move_to-template">
        <label>Coordinate X:</label>
        <input type="number" name="move_to[x]" required placeholder="X" data-label="X">
        <label>Coordinate Y:</label>
        <input type="number" name="move_to[y]" required placeholder="Y" data-label="Y">
    </template>
</body>
</html>
