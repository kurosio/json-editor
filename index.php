<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Удобный JSON Редактор</title>
    <link rel="stylesheet" href="styles.css">
    <!-- Font Awesome для иконок -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- SortableJS для перетаскивания -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js" defer></script>
    <!-- Основной скрипт -->
    <script src="script.js" defer></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>Редактор заданий квестов</h1>
        </header>

        <form id="jsonForm">
            <!-- компоненты секций -->
            <?php
            // определяем типы секций и их заголовки
            $sections = [
                'reward_items' => 'Предметы будут получены по завершению',
                'required_items' => 'Предметы необходимые для завершения',
                'defeat_bots' => 'Боты которых необходимо победить для завершения',
                'move_to' => 'Цели которые необходимо выполнить для завершения'
            ];

            foreach ($sections as $id => $title):
            ?>
                <section class="section" data-section-id="<?php echo $id; ?>">
                    <div class="section-header">
                        <h2><?php echo $title; ?></h2>
                        <span class="toggle-btn"><i class="fas fa-chevron-down"></i></span>
                    </div>
                    <div class="section-content" id="<?php echo $id; ?>_section">
                        <div class="<?php echo $id; ?> items-container">
                            <!-- динамически добавляемые элементы -->
                        </div>
                        <button type="button" class="add-btn" data-add-btn="<?php echo $id; ?>">
                            <i class="fas fa-plus"></i> Добавить
                        </button>
                    </div>
                </section>
            <?php endforeach; ?>

            <div class="buttons">
                <button type="button" class="load-btn">
                    <i class="fas fa-upload"></i> Загрузить JSON
                </button>
            </div>
        </form>

		<section class="output-section">
			<h2>Сгенерированный JSON</h2>
				<textarea id="jsonOutput" name="move_to[completion_text][]" readonly></textarea>
		</section>
    </div>

    <!-- шаблоны для динамического создания элементов -->
    <template id="item-template">
        <div class="item">
            <div class="item-header">
                <div>
                    <span class="item-number">#</span>
                    <span class="item-summary"><span class="summary-display">—</span></span>
                </div>
                <div class="item-buttons">
                    <span class="drag-handle" aria-label="Перетаскивание"><i class="fas fa-arrows-alt"></i></span>
                    <button type="button" class="toggle-item-btn" aria-label="Свернуть/Развернуть">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <button type="button" class="remove-btn" aria-label="Удалить элемент">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="item-content">
                <!-- поля будут добавлены динамически на основе типа секции -->
            </div>
        </div>
    </template>

    <!-- специфичные шаблоны для каждой секции -->
    <template id="reward_items-template">
        <label>ID предмета:</label>
        <input type="number" name="reward_items[id]" required placeholder="ID предмета" data-label="ID предмета">

        <label>Количество:</label>
        <input type="number" name="reward_items[value]" required placeholder="Количество" data-label="Количество">
    </template>

    <template id="required_items-template">
        <label>ID:</label>
        <input type="number" name="required_items[id]" required placeholder="ID предмета" data-label="ID">

        <label>Количество:</label>
        <input type="number" name="required_items[value]" required placeholder="Количество" data-label="Количество">

        <label>Тип:</label>
        <select name="required_items[type]" data-label="Тип">
            <option value="default" selected>Отдать (отдать предмет NPC)</option>
            <option value="show">Показать (показать наличие предмета NPC)</option>
            <option value="pickup">Подобрать (создаются предметы, которые необходимо подобрать около NPC)</option>
        </select>
    </template>

    <template id="defeat_bots-template">
        <label>ID:</label>
        <input type="number" name="defeat_bots[id]" required placeholder="ID бота" data-label="ID бота">

        <label>Количество:</label>
        <input type="number" name="defeat_bots[value]" required placeholder="Количество" data-label="Количество">
    </template>

    <template id="move_to-template">
        <!-- основное -->
        <fieldset>
            <legend>
                Основное
                <button type="button" class="toggle-fieldset-btn" aria-label="Свернуть поле">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </legend>
            <div class="fieldset-content">
                <label>Шаг (опционально):</label>
                <input type="number" name="move_to[step]" placeholder="По умолчанию: 1" data-label="Шаг">

                <label>Навигатор:</label>
                <select name="move_to[navigator]" data-label="Навигатор">
                    <option value="true" selected>Да (показывает полный путь)</option>
                    <option value="false">Нет (показывает путь до области)</option>
                </select>
				
                <label>Название цели (опционально):</label>
                <input type="text" name="move_to[name]" placeholder="По умолчанию: Demands a bit of action" data-label="Название">

                <label>Координата X:</label>
                <input type="number" name="move_to[x]" required placeholder="Координата X" data-label="X">

                <label>Координата Y:</label>
                <input type="number" name="move_to[y]" required placeholder="Координата Y" data-label="Y">

                <label>ID мира (опционально):</label>
                <input type="number" name="move_to[world_id]" placeholder="По умолчанию: текущий мир бота" data-label="ID мира">
            </div>
        </fieldset>

        <!-- задачи (опционально) -->
        <fieldset>
            <legend>
                Задача
                <button type="button" class="toggle-fieldset-btn" aria-label="Свернуть поле">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </legend>
            <div class="fieldset-content">
				<select name="move_to[mode]" data-label="Режим" data-depends-on="move_to[mode]">
					<option value="move" selected>По умолчанию: Просто встать</option>
					<option value="move_press">Требуется нажать</option>
					<option value="move_follow_press">Требуется навестись и нажать</option>
					<option value="defeat_bot">Требуется победить моба</option>
				</select>

				<div data-show-for="move,move_press,move_follow_press">
					<label>Время в секундах для взаимодействия (опционально):</label>
					<input type="number" name="move_to[cooldown]" placeholder="По умолчанию: 0" data-label="Кулдаун">
				</div>

                <label>Текст завершения (опционально):</label>
                <textarea name="move_to[completion_text]" placeholder="Сообщение при завершении" data-label="Текст завершения"></textarea>
				
				<div data-show-for="move_follow_press">
					<label>Координата X:</label>
					<input type="number" name="move_to[interactive][x]" required placeholder="Интерактивная X" data-label="Интерактивная X">
					<label>Координата Y:</label>
					<input type="number" name="move_to[interactive][y]" required placeholder="Интерактивная Y" data-label="Интерактивная Y">
				</div>
				
				<div data-show-for="defeat_bot">
					<label>ID:</label>
					<input type="number" name="move_to[defeat_bot][id]" required placeholder="ID бота" data-label="ID бота для победы">
					<label>Сила атрибута:</label>
					<input type="number" name="move_to[defeat_bot][attribute_power]" required placeholder="По умолчанию: 10" data-label="Сила атрибута бота">
					<label>ID мира (опционально):</label>
					<input type="number" name="move_to[defeat_bot][world_id]" placeholder="По умолчанию: Текущий мир бота" data-label="ID мира">
				</div>
				
				<div data-show-for="move_press,move_follow_press,defeat_bot">
					<div data-show-for="move_press,move_follow_press">
						<fieldset>
							<legend>Необходимый для завершения предмет (опционально)</legend>
							<div class="fieldset-content">
								<label>ID:</label>
								<input type="number" name="move_to[required_item][id]" placeholder="ID предмета" data-label="ID требуемого предмета">
								<label>Количество:</label>
								<input type="number" name="move_to[required_item][value]" placeholder="Количество" data-label="Количество требуемого предмета">
							</div>
						</fieldset>
					</div>
					<fieldset>
						<legend>Получаемый предмет по завершению (опционально)</legend>
						<div class="fieldset-content">
							<label>ID:</label>
							<input type="number" name="move_to[pick_up_item][id]" placeholder="ID предмета" data-label="ID предмета для подбора">
							<label>Количество:</label>
							<input type="number" name="move_to[pick_up_item][value]" placeholder="Количество" data-label="Количество предмета для подбора">
						</div>
					</fieldset>
				</div>
			</div>
        </fieldset>
    </template>
</body>
</html>
