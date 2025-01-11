document.addEventListener('DOMContentLoaded', () => 
{
	class JSONEditor 
	{
		constructor() 
		{
			this.form = document.getElementById('jsonForm');
			this.jsonOutput = document.getElementById('jsonOutput');
			this.addButtons = document.querySelectorAll('.add-btn');
			this.loadButton = document.querySelector('.load-btn');
			this.itemTemplate = document.getElementById('item-template');
			this.templates = {};
			this.initializeTemplates();
			this.initializeLoadButton();
			this.initializeAddButtons();
			this.initializeSections();
			this.initializeSortable();
			this.initializeEventListeners();
			this.generateJSON();
		}

		initializeTemplates() 
		{
			document.querySelectorAll('[id$="-template"]').forEach(template => 
			{
				const templateId = template.id.replace('-template', '');
				this.templates[templateId] = template;
			});
		}

		initializeLoadButton() 
		{
			if(!this.loadButton) 
			{
				console.warn('Load button not found. Skipping initialization.');
				return;
			}
			
			this.loadButton.addEventListener('click', () => 
			{
				this.showJSONInputModal();
			});
		}

		initializeAddButtons() 
		{
			this.addButtons.forEach(button => 
			{
				button.addEventListener('click', () => 
				{
					const sectionType = button.getAttribute('data-add-btn');
					this.addItem(sectionType);
					this.generateJSON();
				});
			});
		}

		initializeSections() 
		{
			const sectionHeaders = document.querySelectorAll('.section-header');
			sectionHeaders.forEach(header => 
			{
				header.addEventListener('click', () => 
				{
					this.toggleSection(header);
				});
			});
		}

		toggleSection(header) 
		{
			const sectionContent = header.nextElementSibling;
			const toggleBtn = header.querySelector('.toggle-btn');
			const isVisible = sectionContent.style.display === 'block';

			if(isVisible) 
			{
				sectionContent.style.display = 'none';
				toggleBtn.classList.remove('rotate');
			} 
			else 
			{
				sectionContent.style.display = 'block';
				toggleBtn.classList.add('rotate');
			}
		}

		addItem(sectionType)
		{
			const container = document.querySelector(`.${sectionType}.items-container`);
			const template = this.templates[sectionType];
			if(!template) 
				return;

			const clone = this.itemTemplate.content.cloneNode(true);
			const itemContent = clone.querySelector('.item-content');
			const specificFields = template.content.cloneNode(true);

			specificFields.querySelectorAll('fieldset').forEach(fieldset => 
			{
				const isCollapsed = fieldset.getAttribute('data-collapsed') === 'true';
				if(isCollapsed) 
				{
					fieldset.classList.add('collapsed');
				}
				else 
				{
					fieldset.classList.remove('collapsed');
				}
			});

			itemContent.appendChild(specificFields);
			container.appendChild(clone);
			this.updateItemNumbers(container);
			this.generateJSON();
		}

		initializeSortable() 
		{
			document.querySelectorAll('.items-container').forEach(container => 
			{
				if(!container.dataset.sortableInitialized) 
				{
					new Sortable(container, 
					{
						animation: 150,
						handle: '.drag-handle',
						draggable: '.item',
						ghostClass: 'sortable-ghost',
						chosenClass: 'sortable-chosen',
						onEnd: () => 
						{
							this.updateItemNumbers(container);
							this.generateJSON();
						}
					});
					container.dataset.sortableInitialized = 'true';
				}
			});
		}

		initializeEventListeners() 
		{
			this.form.addEventListener('click', (event) => 
			{
				const toggleItemBtn = event.target.closest('.toggle-item-btn');
				if(toggleItemBtn) 
				{
					this.toggleItem(toggleItemBtn);
				}

				const removeBtn = event.target.closest('.remove-btn');
				if(removeBtn) 
				{
					this.removeItem(removeBtn);
				}

				const toggleFieldsetBtn = event.target.closest('.toggle-fieldset-btn');
				if(toggleFieldsetBtn) 
				{
					this.toggleFieldset(toggleFieldsetBtn);
				}
			});

			this.form.addEventListener('input', (event) => 
			{
				const target = event.target;
				this.validateField(target);
				this.generateJSON();

				const item = target.closest('.item');
				if(item) 
				{
					this.updateSummary(item);
				}
			});
		}

		toggleItem(button) 
		{
			const item = button.closest('.item');
			const content = item.querySelector('.item-content');
			const isCollapsed = content.classList.contains('collapsed');

			if(isCollapsed) 
			{
				content.classList.remove('collapsed');
				button.innerHTML = '<i class="fas fa-chevron-down"></i>';
			} 
			else 
			{
				content.classList.add('collapsed');
				button.innerHTML = '<i class="fas fa-chevron-up"></i>';
			}
		}

		toggleFieldset(button) 
		{
			const fieldset = button.closest('fieldset');
			fieldset.classList.toggle('collapsed');
		}

		removeItem(button) 
		{
			const item = button.closest('.item');
			const container = item.parentElement;
			item.remove();
			this.updateItemNumbers(container);
			this.generateJSON();
		}

		updateItemNumbers(container) 
		{
			const items = container.querySelectorAll('.item');
			items.forEach((item, index) => 
			{
				const number = item.querySelector('.item-number');
				if(number) 
				{
					number.textContent = `#${index + 1}`;
				}
			});
		}

		updateSummary(container) 
		{
			if(!container) 
				return;

			const summaryDisplay = container.querySelector('.summary-display');
			if(!summaryDisplay) 
				return;

			const fields = container.querySelectorAll('.item-content input, .item-content select, .item-content textarea');
			const summaryData = {};

			fields.forEach(field => 
			{
				const label = field.getAttribute('data-label') || 'Неизвестно';
				let value = field.value.trim();

				if(field.type === 'checkbox') 
				{
					value = field.checked ? 'Да' : 'Нет';
				} 
				else if(field.tagName.toLowerCase() === 'select') 
				{
					value = field.options[field.selectedIndex].text;
				}

				if(value) 
				{
					summaryData[label] = value || '—';
				}
			});

			const summaryText = Object.entries(summaryData)
				.map(([key, value]) => `${key}: ${value}`)
				.join(', ');

			summaryDisplay.textContent = summaryText;
		}

		validateField(field) 
		{
			if(field.required && !field.value.trim()) 
			{
				field.style.borderColor = 'red';
			} 
			else 
			{
				field.style.borderColor = '';
			}
		}

		generateJSON() 
		{
			const jsonData = {};

			// Добавление отдельных флажков вне динамических контейнеров
			const checkboxFields = document.querySelectorAll('input[type="checkbox"]');
			checkboxFields.forEach(checkbox => 
			{
				const name = checkbox.getAttribute('name');
				if(name && checkbox.checked)
				{
					const nameParts = name.match(/\[(.*?)\]/g)?.map(part => part.replace(/\[|\]/g, '')) || [name];
					let current = jsonData;
					nameParts.forEach((part, index) => 
					{
						if(index === nameParts.length - 1) 
						{
							current[part] = checkbox.checked;
						}
						else
						{
							current[part] = current[part] || {};
							current = current[part];
						}
					});
				}
			});

			document.querySelectorAll('.items-container').forEach(container => 
			{
				const sectionType = container.classList[0];
				const sectionItems = [];

				container.querySelectorAll('.item').forEach(item => 
				{
					const itemData = {};
					let hasError = false;

					item.querySelectorAll('input, select, textarea').forEach(field => 
					{
						const nameParts = field.getAttribute('name')?.match(/\[(.*?)\]/g)?.map(part => part.replace(/\[|\]/g, ''));
						if(nameParts)
						{
							let current = itemData;
							nameParts.forEach((part, index) => 
							{
								if(index === nameParts.length - 1)
								{
									// Последний ключ — сохранить значение только если оно установлено
									if(field.type === 'checkbox')
									{
										if(field.checked)
										{
											current[part] = field.checked;
										}
										else if(field.hasAttribute('required'))
										{
											hasError = true;
											field.style.borderColor = 'red';
										}
									}
									else
									{
										let value = field.value.trim();
										if(field.type === 'number' && value !== '')
										{
											value = parseFloat(value);
										}
										if(value !== '')
										{
											current[part] = value;
										} 
										else if(field.hasAttribute('required'))
										{
											hasError = true;
											field.style.borderColor = 'red';
										}
									}
								}
								else
								{
									// Создать вложенный объект, если он не существует
									current[part] = current[part] || {};
									current = current[part];
								}
							});
						}
					});

					// Удалить пустые объекты
					const cleanEmptyFields = (obj) => 
					{
						Object.keys(obj).forEach(key => 
						{
							if(obj[key] && typeof obj[key] === 'object')
							{
								cleanEmptyFields(obj[key]);
								if(Object.keys(obj[key]).length === 0)
								{
									delete obj[key];
								}
							} 
							else if(obj[key] === undefined || obj[key] === '')
							{
								delete obj[key];
							}
						});
					};

					cleanEmptyFields(itemData);
					if(!hasError && Object.keys(itemData).length > 0)
					{
						sectionItems.push(itemData);
					}
				});

				if(sectionItems.length > 0)
				{
					jsonData[sectionType] = sectionItems;
				}
			});

			// Удаление пустых секций
			Object.keys(jsonData).forEach(key => 
			{
				if(Array.isArray(jsonData[key]) && jsonData[key].length === 0) {
					delete jsonData[key];
				}
			});

			this.jsonOutput.textContent = JSON.stringify(jsonData, null, 4);
		}

		showJSONInputModal()
		{
			if(document.querySelector('.json-input-modal'))
				return;

			const modal = document.createElement('div');
			modal.className = 'json-input-modal';
			modal.style.position = 'fixed';
			modal.style.top = '50%';
			modal.style.left = '50%';
			modal.style.transform = 'translate(-50%, -50%)';
			modal.style.background = '#fff';
			modal.style.padding = '20px';
			modal.style.borderRadius = '8px';
			modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
			modal.style.zIndex = '1000';

			const header = document.createElement('h3');
			header.textContent = 'Load JSON';
			header.style.textAlign = 'center';
			modal.appendChild(header);

			const textarea = document.createElement('textarea');
			textarea.style.width = '100%';
			textarea.style.height = '150px';
			textarea.placeholder = 'Paste your JSON here';
			modal.appendChild(textarea);

			const buttonsContainer = document.createElement('div');
			buttonsContainer.style.display = 'flex';
			buttonsContainer.style.justifyContent = 'space-between';
			buttonsContainer.style.marginTop = '15px';

			const loadButton = document.createElement('button');
			loadButton.textContent = 'Load';
			loadButton.style.padding = '10px';
			loadButton.addEventListener('click', () => 
			{
				try
				{
					const jsonData = JSON.parse(textarea.value);
					this.generateDynamicUI(jsonData);
					modal.remove();
				}
				catch (error)
				{
					alert('Invalid JSON');
				}
			});

			const cancelButton = document.createElement('button');
			cancelButton.textContent = 'Cancel';
			cancelButton.style.padding = '10px';
			cancelButton.addEventListener('click', () => 
			{
				modal.remove();
			});

			buttonsContainer.appendChild(loadButton);
			buttonsContainer.appendChild(cancelButton);
			modal.appendChild(buttonsContainer);

			document.body.appendChild(modal);
		}

		generateDynamicUI(jsonData)
		{
			// Очистить текущие контейнеры
			document.querySelectorAll('.items-container').forEach(container => 
			{
				container.innerHTML = '';
			});

			Object.entries(jsonData).forEach(([sectionType, items]) => 
			{
				if(Array.isArray(items))
				{
					const container = document.querySelector(`.${sectionType}.items-container`);
					if(container)
					{
						items.forEach(itemData => 
						{
							const clone = this.itemTemplate.content.cloneNode(true);
							const itemContent = clone.querySelector('.item-content');

							const template = this.templates[sectionType];
							if(template)
							{
								const specificFields = template.content.cloneNode(true);

								// Заполнить поля значениями
								specificFields.querySelectorAll('input, select, textarea').forEach(field => 
								{
									const nameParts = field.getAttribute('name')?.match(/\[(.*?)\]/g)?.map(part => part.replace(/[\[\]]/g, ''));
									if(nameParts)
									{
										let value = itemData;
										nameParts.forEach(part => 
										{
											if(value && typeof value === 'object')
											{
												value = value[part];
											}
										});
										if(field.type === 'checkbox')
										{
											field.checked = Boolean(value);
										}
										else if(value !== undefined)
										{
											field.value = value;
										}
									}
								});

								itemContent.appendChild(specificFields);
								container.appendChild(clone);
							}
						});
					}
				}
			});

			// Collapse all items and update summaries
			document.querySelectorAll('.toggle-item-btn').forEach(button => 
			{
				const item = button.closest('.item');
				const content = item.querySelector('.item-content');
				if(!content.classList.contains('collapsed'))
				{
					content.classList.add('collapsed');
					button.innerHTML = '<i class="fas fa-chevron-up"></i>';
				}
				this.updateSummary(item);
			});

			this.initializeSortable();
			this.generateJSON();
		}
	}

	new JSONEditor();
});
