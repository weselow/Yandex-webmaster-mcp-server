# TDD Workflow

## Цикл RED → GREEN → REFACTOR

### 1. RED — Падающий тест ПЕРВЫМ

```python
# Пример: калькулятор скидок
def test_calculate_total_with_discount():
    calculator = PriceCalculator()
    items = [{"id": "1", "quantity": 2, "price": 100}]
    
    result = calculator.calculate_total(items, discount=0.1)
    
    assert result.subtotal == 200
    assert result.discount == 20
    assert result.total == 180
```

**Запустить тест — он ДОЛЖЕН упасть** (класс/метод ещё не существует).

### 2. GREEN — Минимальный код

```python
class PriceCalculator:
    def calculate_total(self, items, discount=0):
        subtotal = sum(i["quantity"] * i["price"] for i in items)
        discount_amount = subtotal * discount
        return Result(
            subtotal=subtotal,
            discount=discount_amount,
            total=subtotal - discount_amount
        )
```

**Запустить тест — он ДОЛЖЕН пройти.**

### 3. REFACTOR — Улучшить при зелёных тестах

```python
class PriceCalculator:
    def calculate_total(self, items, discount=0):
        subtotal = self._calculate_subtotal(items)
        discount_amount = self._apply_discount(subtotal, discount)
        return Result(subtotal, discount_amount, subtotal - discount_amount)
    
    def _calculate_subtotal(self, items):
        return sum(i["quantity"] * i["price"] for i in items)
    
    def _apply_discount(self, amount, rate):
        return amount * rate
```

**Запустить тест после каждого изменения.**

## ЗАПРЕЩЁННЫЕ действия

### ❌ Изменение теста под сломанный код

```python
# Тест ожидает строку:
assert result.status == "active"

# Код возвращает enum:
# ❌ НЕПРАВИЛЬНО: изменить тест
assert result.status == Status.ACTIVE

# ✅ ПРАВИЛЬНО: изменить код чтобы возвращал строку
# или изменить контракт если это осознанное решение
```

### ❌ Написание кода без запуска тестов

```bash
# ❌ НЕПРАВИЛЬНО
# Написать 100 строк кода
# Запустить тесты в конце
# Получить 15 ошибок

# ✅ ПРАВИЛЬНО
# Написать 10 строк → запустить тесты
# Написать ещё 10 строк → запустить тесты
# Итеративно, маленькими шагами
```

### ❌ Предположение что тесты проходят

Всегда проверять фактически. "Должно работать" ≠ работает.

## Правильный подход при ошибке компиляции

1. Прочитать сообщение об ошибке внимательно
2. Определить какой API ожидает тест
3. Имплементировать этот API в коде
4. Запустить тесты
5. **НИКОГДА** не менять тест под текущий код

## Типы тестов и TDD

| Слой | TDD | Покрытие |
|------|-----|----------|
| Domain (entities, value objects) | Строгий | >80% |
| Application (use cases, services) | Строгий | >80% |
| Infrastructure (repos, external) | Для логики | >60% |
| Presentation (controllers, API) | Для контроллеров | >60% |

## Чеклист перед завершением

- [ ] Тесты написаны ДО имплементации
- [ ] Соблюдён цикл RED → GREEN → REFACTOR
- [ ] Все тесты проходят
- [ ] Покрытие соответствует требованиям
- [ ] Нет изменений тестов для исправления компиляции
- [ ] Код компилируется без ошибок
- [ ] Линтер проходит без ошибок
