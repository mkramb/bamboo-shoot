describe('LoginCtrl', function () {
  beforeEach(module('app'));

  beforeEach(inject(function($rootScope, $controller, $httpBackend) {
    this.scope = $rootScope.$new();
    this.httpBackend = $httpBackend;
    this.state = {
      go: function() {},
      next: 'home'
    };

    sinon.stub(this.state, 'go')
      .withArgs(this.state.next)
      .returns(this.state.next);

    this.mockData = {
      username: 'username',
      hostname: 'https://bamboo-instance.com'
    };

    $controller('LoginCtrl', {
      $scope: this.scope,
      $state: this.state
    });
  }));

  it('should have initial state', function() {
    expect(this.scope.loading).to.equal(null);
  });

  it('should be on login page', function() {
    expect(this.scope.section).to.equal('login');
  });

  describe('submit', function () {
    beforeEach(function() {
      this.httpBackend.expectGET(
        new RegExp(
          this.mockData.hostname
          + '/rest/api/latest/search/users\\?searchTerm=.*')
      )
        .respond(200, {
          size: 1,
          searchResults: [{
            searchEntity: this.mockData
          }]
        });

      this.scope.submit(
        this.mockData
      );

      this.httpBackend.flush();
    });

    afterEach(function() {
      this.httpBackend.verifyNoOutstandingExpectation();
      this.httpBackend.verifyNoOutstandingRequest();
    });

    it('should transition to home', function() {
      expect(this.state.go.getCall(0).args[0]).to.equal(this.state.next);
      expect(this.state.go.returnValues[0]).to.equal(this.state.next);
    });
  });
});
