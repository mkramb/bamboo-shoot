'use strict';

process.on('message', function(message) {
  try {
    var summaries = checkUpdates(
      message.latestResult,
      message.newResult
    );

    var data = {
      resultSummaries: summaries,
      newResult: message.newResult
    };

    process.send(data);
    summaries = null;
    data = null;
  }
  catch(err) {
    process.send({});
  }
});

var findbranch = function(branches, qryBranch) {
  var foundbranch = null;

  branches.forEach(function (branch) {
    if (
      branch.branchName === qryBranch.branchName
      && branch.repositoryName === qryBranch.repositoryName
    ) {
      foundbranch = branch;
    }
  });

  return foundbranch;
};

var findRepo = function(repos, qryRepo) {
  var foundRepo = null;

  repos.forEach(function (repo) {
    if (repo.name === qryRepo.name) {
      foundRepo = repo;
    }
  });

  return foundRepo;
};

var findbranch = function(branches, qryBranch) {
  var foundbranch = null;

  branches.forEach(function (branch) {
    if (
      branch.branchName === qryBranch.branchName
      && branch.repositoryName === qryBranch.repositoryName
    ) {
      foundbranch = branch;
    }
  });

  return foundbranch;
};

var findResultSummary = function(resultSummaries, qryResultSummary) {
  var foundResultSummary = null;

  resultSummaries.forEach(function (resultSummary) {
    if (
      resultSummary.planKey === qryResultSummary.planKey
      && resultSummary.buildNumber === qryResultSummary.buildNumber
      && resultSummary.buildState === qryResultSummary.buildState
    ) {
      foundResultSummary = resultSummary;
    }
  });

  return foundResultSummary;
};

var checkUpdates = function(latestResult, newResult, callback) {
  var oldResult = latestResult;
  var resultSummaries = [];

  if (!oldResult.length) {
    return resultSummaries;
  }

  newResult.forEach(function(newRepo) {
    var oldRepo = findRepo(oldResult, newRepo);

    if (oldRepo === null) {
      // entire new repo
      newRepo.branches.forEach(function(branch) {
        resultSummaries = resultSummaries.concat(branch.resultSummaries);
      });
    }
    else {
      newRepo.branches.forEach(function(newBranch) {
        var oldbranch = findbranch(oldRepo.branches, newBranch);

        if (oldbranch === null) {
          // entire new branch to add
          resultSummaries = resultSummaries.concat(newBranch.resultSummaries);
        }
        else {
          newBranch.resultSummaries.forEach(function(newResultSummary) {
            var oldResultSummary = findResultSummary(
              oldbranch.resultSummaries, newResultSummary
            );
            if (oldResultSummary === null) {
              // new plan to add
              resultSummaries.push(newResultSummary);
            }
          });
        }
      });
    }
  });

  return resultSummaries;
};
