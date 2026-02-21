# Testing Patterns

## Test Data Builder

Паттерн для создания тестовых данных с дефолтами и кастомизацией.

```python
class UserBuilder:
    def __init__(self):
        self._data = {
            "id": "user-1",
            "email": "test@example.com",
            "role": "user",
            "active": True
        }
    
    def with_id(self, id): 
        self._data["id"] = id
        return self
    
    def with_role(self, role):
        self._data["role"] = role
        return self
    
    def inactive(self):
        self._data["active"] = False
        return self
    
    def build(self):
        return User(**self._data)

# Использование
admin = UserBuilder().with_role("admin").build()
inactive_user = UserBuilder().inactive().build()
```

## Mocking

### Создание моков

```python
# Mock repository
mock_repo = Mock(spec=IUserRepository)
mock_repo.find_by_id.return_value = user

# Mock external service  
mock_email = Mock(spec=IEmailService)
mock_email.send.return_value = {"success": True}

# Inject into service
service = UserService(mock_repo, mock_email)
```

### Очистка между тестами

```python
def teardown_method(self):
    mock_repo.reset_mock()
    mock_email.reset_mock()
```

## Error Scenario Testing (ОБЯЗАТЕЛЬНО)

```python
def test_handles_database_connection_error():
    mock_repo.find_by_id.side_effect = DatabaseConnectionError()
    
    with pytest.raises(ServiceUnavailableError):
        service.get_user("123")

def test_handles_validation_error():
    with pytest.raises(ValidationError):
        service.create_user({"email": "not-an-email"})

def test_handles_not_found():
    mock_repo.find_by_id.return_value = None
    
    with pytest.raises(NotFoundError):
        service.get_user("nonexistent")
```

## Integration Test Structure

```python
class TestUserAPI:
    @classmethod
    def setup_class(cls):
        cls.app = create_test_app()
        cls.client = cls.app.test_client()
        cls.auth_token = get_test_auth_token()
    
    @classmethod
    def teardown_class(cls):
        cleanup_database()
    
    def setup_method(self):
        clear_test_data()
    
    def test_create_user_with_valid_data(self):
        response = self.client.post(
            "/api/users",
            json={"email": "new@example.com", "name": "Test"},
            headers={"Authorization": f"Bearer {self.auth_token}"}
        )
        
        assert response.status_code == 201
        assert response.json["data"]["email"] == "new@example.com"
        
        # Verify in database
        user = User.query.get(response.json["data"]["id"])
        assert user is not None

    def test_returns_422_for_invalid_data(self):
        response = self.client.post(
            "/api/users",
            json={"email": "invalid", "name": ""},
            headers={"Authorization": f"Bearer {self.auth_token}"}
        )
        
        assert response.status_code == 422
        assert "validation" in response.json["error"]["code"].lower()
```

## Performance Testing

```python
def test_bulk_operation_performance():
    items = generate_test_items(1000)
    
    start = time.time()
    result = service.process_bulk(items)
    duration = time.time() - start
    
    assert duration < 0.2  # 200ms limit
    assert len(result) == 1000
```

## Test Naming Convention

```
✅ Хорошие имена (описывают поведение):
- test_returns_user_when_found
- test_throws_validation_error_for_invalid_email  
- test_creates_order_with_calculated_total
- test_sends_notification_after_payment

❌ Плохие имена:
- test_get_user
- test_validation
- test_it_works
- test_1
```

## Checklist для тестов

- [ ] Тесты следуют AAA (Arrange-Act-Assert)
- [ ] Каждый тест проверяет одно поведение
- [ ] Имена описывают ожидаемое поведение
- [ ] Error cases покрыты
- [ ] Edge cases покрыты
- [ ] Нет `.skip` или `.only` в коммите
- [ ] Нет flaky тестов
- [ ] Моки очищаются между тестами
